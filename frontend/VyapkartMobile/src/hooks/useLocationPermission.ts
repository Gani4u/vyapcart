// src/hooks/useLocationPermission.ts

import { useState, useCallback } from 'react';
import LocationService, { LocationAccuracy, PermissionDuration, PermissionResult } from '../services/location.service';
import { GeolocationPosition } from '../types/location';

interface UseLocationPermissionReturn {
  permissionDialogVisible: boolean;
  showPermissionDialog: () => void;
  hidePermissionDialog: () => void;
  requestLocation: (onLocationReceived: (position: GeolocationPosition) => void) => Promise<void>;
  handlePrecisePermission: (duration: PermissionDuration) => Promise<void>;
  handleApproximatePermission: (duration: PermissionDuration) => Promise<void>;
  handleDenyPermission: () => Promise<void>;
  handleOpenSettings: () => Promise<void>;
  loading: boolean;
  error: string | null;
  isBlocked: boolean;
}

/**
 * Hook for managing location permission dialog and requests
 */
export const useLocationPermission = (): UseLocationPermissionReturn => {
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<
    ((position: GeolocationPosition) => void) | null
  >(null);

  const showPermissionDialog = useCallback(() => {
    setPermissionDialogVisible(true);
    setError(null);
    setIsBlocked(false);
  }, []);

  const hidePermissionDialog = useCallback(() => {
    setPermissionDialogVisible(false);
    setPendingCallback(null);
    setIsBlocked(false);
  }, []);

  const handleOpenSettings = useCallback(async () => {
    try {
      setLoading(true);
      await LocationService.openAppSettings();
      // Keep dialog visible so user can return
    } catch (err: any) {
      console.error('Error opening settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrecisePermission = useCallback(
    async (duration: PermissionDuration) => {
      try {
        setLoading(true);
        setError(null);
        setIsBlocked(false);

        const result = await LocationService.requestLocationPermission('precise', duration);

        // Check if result is a PermissionResult object (blocked/denied case)
        if (typeof result === 'object' && 'granted' in result) {
          const permResult = result as PermissionResult;
          
          if (permResult.blocked) {
            setIsBlocked(true);
            setError(permResult.message);
            return;
          }
          
          if (!permResult.granted) {
            setError(permResult.message);
            return;
          }
        }

        if (result === true || (typeof result === 'object' && (result as PermissionResult).granted)) {
          const position = await LocationService.getCurrentLocation('precise');
          pendingCallback?.(position);
          hidePermissionDialog();
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get location';
        setError(errorMessage);
        console.error('Error getting precise location:', err);
      } finally {
        setLoading(false);
      }
    },
    [pendingCallback, hidePermissionDialog]
  );

  const handleApproximatePermission = useCallback(
    async (duration: PermissionDuration) => {
      try {
        setLoading(true);
        setError(null);
        setIsBlocked(false);

        const result = await LocationService.requestLocationPermission('approximate', duration);

        // Check if result is a PermissionResult object (blocked/denied case)
        if (typeof result === 'object' && 'granted' in result) {
          const permResult = result as PermissionResult;
          
          if (permResult.blocked) {
            setIsBlocked(true);
            setError(permResult.message);
            return;
          }
          
          if (!permResult.granted) {
            setError(permResult.message);
            return;
          }
        }

        if (result === true || (typeof result === 'object' && (result as PermissionResult).granted)) {
          const position = await LocationService.getCurrentLocation('approximate');
          pendingCallback?.(position);
          hidePermissionDialog();
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to get location';
        setError(errorMessage);
        console.error('Error getting approximate location:', err);
      } finally {
        setLoading(false);
      }
    },
    [pendingCallback, hidePermissionDialog]
  );

  const handleDenyPermission = useCallback(async () => {
    try {
      setLoading(true);
      await LocationService.clearPermissionSettings();
      hidePermissionDialog();
    } catch (err: any) {
      console.error('Error denying permission:', err);
    } finally {
      setLoading(false);
    }
  }, [hidePermissionDialog]);

  const requestLocation = useCallback(
    async (onLocationReceived: (position: GeolocationPosition) => void) => {
      try {
        setLoading(true);
        setError(null);

        // Check if permission already exists
        const hasPermission = await LocationService.checkLocationPermission('precise');

        if (hasPermission) {
          const position = await LocationService.getCurrentLocation('precise');
          onLocationReceived(position);
        } else {
          // Show permission dialog
          setPendingCallback(() => onLocationReceived);
          showPermissionDialog();
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to request location';
        setError(errorMessage);
        console.error('Error requesting location:', err);

        // Show permission dialog on error
        setPendingCallback(() => onLocationReceived);
        showPermissionDialog();
      } finally {
        setLoading(false);
      }
    },
    [showPermissionDialog]
  );

  return {
    permissionDialogVisible,
    showPermissionDialog,
    hidePermissionDialog,
    requestLocation,
    handlePrecisePermission,
    handleApproximatePermission,
    handleDenyPermission,
    handleOpenSettings,
    loading,
    error,
    isBlocked,
  };
};
