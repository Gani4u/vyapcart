// src/screens/SellerLocationScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  updateSellerLocation,
  getSellerLocation,
} from '../api/location.api';
import {
  SellerLocationRequest,
  SellerLocationResponse,
} from '../types/location';
import {
  isValidLatitude,
  isValidLongitude,
  isValidDeliveryRadius,
  getLocationValidationError,
  formatCoordinates,
} from '../utils/locationValidation';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { LocationPermissionDialog } from '../components/LocationPermissionDialog';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
}

const SellerLocationScreen: React.FC<Props> = ({ navigation }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('10');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<SellerLocationResponse | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    permissionDialogVisible,
    showPermissionDialog,
    hidePermissionDialog,
    requestLocation,
    handlePrecisePermission,
    handleApproximatePermission,
    handleDenyPermission,
    handleOpenSettings,
    isBlocked,
    loading: locationLoading,
    error: locationError,
  } = useLocationPermission();

  useEffect(() => {
    fetchCurrentLocation();
  }, []);

  const fetchCurrentLocation = async () => {
    try {
      setFetching(true);
      const location = await getSellerLocation();
      setCurrentLocation(location);
      setLatitude(location.latitude.toString());
      setLongitude(location.longitude.toString());
      setDeliveryRadius(location.deliveryRadiusKm.toString());
    } catch (error: any) {
      console.log('Note: No location set yet');
    } finally {
      setFetching(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const latError = getLocationValidationError('latitude', latitude);
    if (latError) newErrors.latitude = latError;

    const lonError = getLocationValidationError('longitude', longitude);
    if (lonError) newErrors.longitude = lonError;

    const radiusError = getLocationValidationError('deliveryRadius', deliveryRadius);
    if (radiusError) newErrors.deliveryRadius = radiusError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields');
      return;
    }

    setLoading(true);

    try {
      const locationData: SellerLocationRequest = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        deliveryRadiusKm: parseInt(deliveryRadius, 10),
      };

      const updated = await updateSellerLocation(locationData);
      setCurrentLocation(updated);

      Alert.alert(
        'Success',
        'Your location has been updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update location';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    requestLocation((position) => {
      setLatitude(position.coords.latitude.toString());
      setLongitude(position.coords.longitude.toString());
      Alert.alert('Success', 'Location fetched successfully! Please update to save.');
    });
  };

  const handleRefresh = () => {
    setLatitude('');
    setLongitude('');
    setDeliveryRadius('10');
    setErrors({});
    setCurrentLocation(null);
  };

  if (fetching) {
    return (
      <View
        style={[
          globalStyles.container,
          { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[globalStyles.text, { marginTop: spacing.md }]}>
          Loading current location...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[globalStyles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: spacing.lg }}
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[globalStyles.heading, { color: colors.primary }]}>
            Your Location
          </Text>
          <Text style={[globalStyles.label, { marginTop: spacing.sm, color: colors.textSecondary }]}>
            Update your store location and delivery radius
          </Text>
        </View>

        {/* Current Location Display */}
        {currentLocation && (
          <View
            style={{
              backgroundColor: colors.success,
              padding: spacing.lg,
              borderRadius: 8,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={[globalStyles.label, { color: colors.background, marginBottom: spacing.sm }]}>
              Current Location
            </Text>
            <Text
              style={[
                globalStyles.text,
                { color: colors.background, fontWeight: '600', marginBottom: spacing.xs },
              ]}
            >
              {currentLocation.businessName}
            </Text>
            <Text style={[globalStyles.text, { color: colors.background }]}>
              {formatCoordinates(currentLocation.latitude, currentLocation.longitude)}
            </Text>
            <Text style={[globalStyles.text, { color: colors.background, marginTop: spacing.sm }]}>
              Delivery Radius: {currentLocation.deliveryRadiusKm} km
            </Text>
          </View>
        )}

        {/* Form Section */}
        <View>
          {/* Latitude */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[globalStyles.label, { marginBottom: spacing.sm }]}>
              Latitude <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.latitude ? { borderColor: colors.error } : {},
              ]}
              placeholder="e.g., 28.6139"
              placeholderTextColor={colors.textSecondary}
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="decimal-pad"
              editable={!loading}
              maxLength={10}
            />
            {errors.latitude && (
              <Text style={[globalStyles.errorText, { marginTop: spacing.xs }]}>
                {errors.latitude}
              </Text>
            )}
            <Text style={[globalStyles.text, { marginTop: spacing.xs, color: colors.textSecondary, fontSize: 12 }]}>
              Range: -90 to 90
            </Text>
          </View>

          {/* Longitude */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[globalStyles.label, { marginBottom: spacing.sm }]}>
              Longitude <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.longitude ? { borderColor: colors.error } : {},
              ]}
              placeholder="e.g., 77.2090"
              placeholderTextColor={colors.textSecondary}
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="decimal-pad"
              editable={!loading}
              maxLength={11}
            />
            {errors.longitude && (
              <Text style={[globalStyles.errorText, { marginTop: spacing.xs }]}>
                {errors.longitude}
              </Text>
            )}
            <Text style={[globalStyles.text, { marginTop: spacing.xs, color: colors.textSecondary, fontSize: 12 }]}>
              Range: -180 to 180
            </Text>
          </View>

          {/* Delivery Radius */}
          <View style={{ marginBottom: spacing.lg }}>
            <Text style={[globalStyles.label, { marginBottom: spacing.sm }]}>
              Delivery Radius (km) <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                errors.deliveryRadius ? { borderColor: colors.error } : {},
              ]}
              placeholder="e.g., 15"
              placeholderTextColor={colors.textSecondary}
              value={deliveryRadius}
              onChangeText={(text) => setDeliveryRadius(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              editable={!loading}
              maxLength={3}
            />
            {errors.deliveryRadius && (
              <Text style={[globalStyles.errorText, { marginTop: spacing.xs }]}>
                {errors.deliveryRadius}
              </Text>
            )}
            <Text style={[globalStyles.text, { marginTop: spacing.xs, color: colors.textSecondary, fontSize: 12 }]}>
              Range: 1 to 100 km
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
          <TouchableOpacity
            style={[
              globalStyles.button,
              { flex: 1, backgroundColor: colors.primary },
              (loading || locationLoading) && { opacity: 0.6 },
            ]}
            onPress={handleUpdate}
            disabled={loading || locationLoading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[globalStyles.buttonText, { color: colors.background }]}>
                Update Location
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { flex: 1, backgroundColor: colors.border }]}
            onPress={handleRefresh}
            disabled={loading || locationLoading}
          >
            <Text style={[globalStyles.buttonText, { color: colors.text }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>

        {/* Use Current Location Button */}
        <TouchableOpacity
          style={[
            globalStyles.button,
            { 
              backgroundColor: colors.primary, 
              marginTop: spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            },
            (loading || locationLoading) && { opacity: 0.6 },
          ]}
          onPress={handleUseCurrentLocation}
          disabled={loading || locationLoading}
        >
          {locationLoading ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <>
              <Text style={{ fontSize: 18, marginRight: spacing.sm }}>📍</Text>
              <Text style={[globalStyles.buttonText, { color: colors.background }]}>
                Use Current Location
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View
          style={{
            backgroundColor: colors.infoBg,
            padding: spacing.lg,
            borderRadius: 8,
            marginTop: spacing.xl,
          }}
        >
          <Text style={[globalStyles.label, { color: colors.info, marginBottom: spacing.sm }]}>
            💡 Help
          </Text>
          <Text style={{ color: colors.info, lineHeight: 20, fontSize: 13 }}>
            Set your store's location using latitude and longitude coordinates. Customers
            will be able to find your products within your specified delivery radius.
          </Text>
        </View>
      </ScrollView>

      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        visible={permissionDialogVisible}
        appName="Vyapkart"
        onPrecisePermission={handlePrecisePermission}
        onApproximatePermission={handleApproximatePermission}
        onDeny={handleDenyPermission}
        onOpenSettings={handleOpenSettings}
        loading={locationLoading}
        isBlocked={isBlocked}
      />
    </KeyboardAvoidingView>
  );
};

export default SellerLocationScreen;
