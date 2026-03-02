// src/services/location.service.ts

import { GeolocationPosition } from '../types/location';
import { Platform, Linking } from 'react-native';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Location service for handling device geolocation
 * Native React Native implementation using built-in APIs
 */

export type LocationAccuracy = 'precise' | 'approximate';
export type PermissionDuration = 'always' | 'once';

// Define geolocation interface for type safety
interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  altitudeAccuracy: number | null;
  heading: number | null;
  speed: number | null;
}

interface GeolocationPositionInternal {
  coords: GeolocationCoords;
  timestamp: number;
}

export interface PermissionResult {
  granted: boolean;
  blocked: boolean;
  denied: boolean;
  message: string;
}

export class LocationService {
  private static readonly PERMISSION_STORAGE_KEY = 'location_permission_settings';
  private static readonly LAST_LOCATION_KEY = 'last_location';

  /**
   * Get current device location with proper error handling
   * TODO: Integrate with @react-native-geolocation-service or custom native module
   */
  static async getCurrentLocation(
    accuracy: LocationAccuracy = 'precise'
  ): Promise<GeolocationPosition> {
    // First request permission
    const hasPermission = await this.requestLocationPermission(accuracy);
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    // Try to get location from cache first
    const cachedLocation = await this.getCachedLocation();
    if (cachedLocation) {
      console.log('📍 Using cached location');
      return cachedLocation;
    }

    // Return mock location for development
    console.warn('⚠️ Using mock location. Install @react-native-geolocation-service for real location.');
    const mockLocation: GeolocationPosition = {
      coords: {
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    // Cache the location
    await this.cacheLocation(mockLocation);
    return mockLocation;
  }

  /**
   * Watch location changes
   * TODO: Implement with real geolocation service
   */
  static watchLocation(
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: Error) => void,
    options?: { timeout?: number; maximumAge?: number }
  ): number {
    console.warn('⚠️ Location watching not yet implemented. Install @react-native-geolocation-service.');
    // Return a dummy watch ID - real implementation would use native geolocation
    return Math.random();
  }

  /**
   * Stop watching location
   */
  static clearWatch(watchId: number): void {
    // Placeholder for clearing watch
    console.log('Clearing watch:', watchId);
  }

  /**
   * Request location permission (platform specific)
   * This is required for Android 6+ and iOS 8+
   * Returns detailed permission status
   */
  static async requestLocationPermission(
    accuracy: LocationAccuracy = 'precise',
    duration: PermissionDuration = 'always'
  ): Promise<boolean | PermissionResult> {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : accuracy === 'precise'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;

      console.log(`🔐 Requesting ${accuracy} location permission (${duration})...`);

      const result = await request(permission);

      console.log('Permission result:', result);

      if (result === RESULTS.GRANTED) {
        console.log('✅ Location permission granted');
        
        // Store permission settings
        await this.savePermissionSettings(accuracy, duration);
        return {
          granted: true,
          blocked: false,
          denied: false,
          message: 'Location permission granted successfully',
        };
      } else if (result === RESULTS.DENIED) {
        console.log('❌ Location permission denied by user');
        return {
          granted: false,
          blocked: false,
          denied: true,
          message: 'You denied location permission. Please enter your address manually or enable it in settings.',
        };
      } else if (result === RESULTS.BLOCKED) {
        console.log('🚫 Location permission blocked - user needs to enable in settings');
        return {
          granted: false,
          blocked: true,
          denied: false,
          message: 'Location permission is blocked. Please enable it in Settings > Apps > [Your App] > Permissions > Location',
        };
      }

      return {
        granted: false,
        blocked: false,
        denied: false,
        message: 'Unable to determine permission status',
      };
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      return {
        granted: false,
        blocked: false,
        denied: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Open app settings to enable location
   */
  static async openAppSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        // iOS settings
        Linking.openURL('app-settings:');
      } else {
        // Android settings - open location settings
        Linking.openSettings();
      }
    } catch (error) {
      console.error('❌ Error opening settings:', error);
    }
  }

  /**
   * Check if permission is blocked
   */
  static async isPermissionBlocked(accuracy: LocationAccuracy = 'precise'): Promise<boolean> {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : accuracy === 'precise'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;

      const result = await check(permission);
      console.log('Permission check result:', result);
      return result === RESULTS.BLOCKED;
    } catch (error) {
      console.error('Error checking permission blocked status:', error);
      return false;
    }
  }

  /**
   * Check if location permission is already granted
   */
  static async checkLocationPermission(accuracy: LocationAccuracy = 'precise'): Promise<boolean> {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : accuracy === 'precise'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Save permission settings to storage
   */
  static async savePermissionSettings(
    accuracy: LocationAccuracy,
    duration: PermissionDuration
  ): Promise<void> {
    try {
      const settings = {
        accuracy,
        duration,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        this.PERMISSION_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving permission settings:', error);
    }
  }

  /**
   * Get saved permission settings
   */
  static async getPermissionSettings(): Promise<{
    accuracy: LocationAccuracy;
    duration: PermissionDuration;
    timestamp: string;
  } | null> {
    try {
      const settings = await AsyncStorage.getItem(this.PERMISSION_STORAGE_KEY);
      if (settings) {
        return JSON.parse(settings);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving permission settings:', error);
      return null;
    }
  }

  /**
   * Clear stored permission settings (for "Only this time" option)
   */
  static async clearPermissionSettings(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PERMISSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing permission settings:', error);
    }
  }

  /**
   * Format location data for storage
   */
  static formatLocationData(position: GeolocationPosition) {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: new Date(position.timestamp).toISOString(),
    };
  }

  /**
   * Check if location is valid (within acceptable range)
   */
  static isValidLocation(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Cache location data locally
   */
  private static async cacheLocation(location: GeolocationPosition): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.LAST_LOCATION_KEY,
        JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        })
      );
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  /**
   * Get cached location from storage
   */
  private static async getCachedLocation(): Promise<GeolocationPosition | null> {
    try {
      const cached = await AsyncStorage.getItem(this.LAST_LOCATION_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();
      const age = now - data.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes

      // Return cached location if less than 5 minutes old
      if (age < maxAge) {
        return {
          coords: {
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: data.accuracy,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: data.timestamp,
        };
      }

      return null;
    } catch (error) {
      console.error('Error retrieving cached location:', error);
      return null;
    }
  }
}

export default LocationService;

