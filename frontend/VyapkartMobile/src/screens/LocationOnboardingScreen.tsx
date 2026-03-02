// src/screens/LocationOnboardingScreen.tsx
// Beautiful location permission onboarding like Instamart & Swiggy

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import LocationService, { PermissionResult } from '../services/location.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
}

const { width } = Dimensions.get('window');

const LocationOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    // Start icon animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
    }).start();

    // Check if already has permission stored
    checkExistingPermission();
  }, []);

  const checkExistingPermission = async () => {
    try {
      const isBlocked = await LocationService.isPermissionBlocked('precise');
      if (isBlocked) {
        setIsBlocked(true);
      }
    } catch (error) {
      console.error('Error checking permission:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      setLoading(true);
      setIsBlocked(false);

      const result = await LocationService.requestLocationPermission('precise', 'always');

      // If result is object with permission status
      if (typeof result === 'object' && 'granted' in result) {
        const permResult = result as PermissionResult;

        if (permResult.granted) {
          // Permission granted - get location and proceed
          const position = await LocationService.getCurrentLocation('precise');
          await AsyncStorage.setItem('user_location_permission', 'granted');
          await AsyncStorage.setItem('location_onboarding_completed', 'true');
          
          // Replace the entire navigation stack to go directly to NearbyProducts
          navigation.replace('BuyerTabs');
          
          // Then navigate to NearbyProducts with location data
          navigation.navigate('NearbyProducts', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        } else if (permResult.blocked) {
          // Permission blocked - show blocked UI
          setIsBlocked(true);
          setLoading(false);
        } else {
          // Permission denied - fall through to skip flow
          await handleSkip();
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setLoading(true);
      await AsyncStorage.setItem('user_location_permission', 'skipped');
      // Navigate to address input as modal
      navigation.navigate('AddressInput', { fromOnboarding: true });
    } catch (error) {
      console.error('Error skipping:', error);
      setLoading(false);
    }
  };

  const handleOpenSettings = async () => {
    try {
      await LocationService.openAppSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  };

  // Blocked state UI
  if (isBlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.blockedIcon}>🚫</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Permission Blocked</Text>

          {/* Description */}
          <Text style={styles.description}>
            Location permission is blocked in your device settings. Enable it to get faster checkout and personalized recommendations.
          </Text>

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionStep}>📱 Go to Settings</Text>
            <Text style={styles.instructionStep}>🔍 Find Apps & Permissions</Text>
            <Text style={styles.instructionStep}>📍 Select Vyapkart</Text>
            <Text style={styles.instructionStep}>✓ Enable Location</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>Use Address Instead</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleOpenSettings}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.buttonText}>Open Settings</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main permission request UI (Instamart/Swiggy style)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.icon}>📍</Text>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Find Products Near You</Text>

        {/* Description */}
        <Text style={styles.description}>
          Enable location to discover nearby stores and get instant checkout with real-time delivery tracking.
        </Text>

        {/* Features List */}
        <View style={styles.featuresList}>
          <FeatureRow icon="⚡" text="Instant Checkout" />
          <FeatureRow icon="🚚" text="Real-time Tracking" />
          <FeatureRow icon="🎁" text="Personalized Deals" />
          <FeatureRow icon="📍" text="Nearby Stores" />
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Enter Address</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleRequestPermission}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Enable Location</Text>
                <Text style={styles.buttonSubtext}>Takes 2 seconds</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <Text style={styles.privacyText}>
          We respect your privacy. Location is only used for showing nearby products.
        </Text>
      </View>
    </SafeAreaView>
  );
};

// Feature Row Component
const FeatureRow: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  blockedIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  featuresList: {
    marginBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  instructionsBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  instructionStep: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  privacyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});

export default LocationOnboardingScreen;
