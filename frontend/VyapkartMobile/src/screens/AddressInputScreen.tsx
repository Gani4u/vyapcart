// src/screens/AddressInputScreen.tsx

import React, { useState } from 'react';
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
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lookupPincode } from '../api/location.api';
import { PincodeResponse } from '../types/location';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { premiumStyles } from '../styles/designSystem';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
  onAddressSelected?: (address: AddressData) => void;
}

interface AddressData {
  street: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  fullAddress: string;
}

const AddressInputScreen: React.FC<Props> = ({ navigation, onAddressSelected }) => {
  const [street, setStreet] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pincodeData, setPincodeData] = useState<PincodeResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAddresses, setSavedAddresses] = useState<AddressData[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  React.useEffect(() => {
    loadSavedAddresses();
  }, []);

  const loadSavedAddresses = async () => {
    try {
      const saved = await AsyncStorage.getItem('SAVED_ADDRESSES');
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    } catch (error) {
      console.log('No saved addresses found');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = 'Invalid pincode format (6 digits required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchPincode = async () => {
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) {
      setErrors((prev) => ({
        ...prev,
        pincode: 'Please enter a valid 6-digit pincode',
      }));
      return;
    }

    setSearching(true);
    try {
      const data = await lookupPincode(pincode);
      setPincodeData(data);
      setCity(data.city);
      setState(data.state);
      setErrors((prev) => ({ ...prev, pincode: '' }));
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        pincode: error.message || 'Pincode not found',
      }));
      setPincodeData(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmitAddress = () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check all fields');
      return;
    }

    if (!pincodeData) {
      Alert.alert('Error', 'Please search and verify your pincode first');
      return;
    }

    setLoading(true);

    try {
      const addressData: AddressData = {
        street: street.trim(),
        city: city || pincodeData.city,
        state: state || pincodeData.state,
        pincode: pincode.trim(),
        latitude: pincodeData.latitude,
        longitude: pincodeData.longitude,
        fullAddress: `${street}, ${city || pincodeData.city}, ${state || pincodeData.state} - ${pincode}`,
      };

      // Save address
      saveAddress(addressData);

      // Mark onboarding as completed if coming from onboarding
      const route = navigation.getState()?.routes[navigation.getState()?.routes.length - 1];
      const fromOnboarding = route?.params?.fromOnboarding;
      if (fromOnboarding) {
        AsyncStorage.setItem('location_onboarding_completed', 'true');
      }

      if (onAddressSelected) {
        onAddressSelected(addressData);
      }

      // Auto-navigate to products
      if (fromOnboarding) {
        // Close modal first, then navigate to NearbyProducts
        navigation.goBack();
        // Use a small delay to ensure modal closes before navigation
        setTimeout(() => {
          navigation.navigate('NearbyProducts', {
            latitude: addressData.latitude,
            longitude: addressData.longitude,
            address: addressData.fullAddress,
          });
        }, 100);
      } else {
        Alert.alert('Success', 'Address added successfully!', [
          {
            text: 'View Products',
            onPress: () => {
              navigation.goBack();
              setTimeout(() => {
                navigation.navigate('NearbyProducts', {
                  latitude: addressData.latitude,
                  longitude: addressData.longitude,
                  address: addressData.fullAddress,
                });
              }, 100);
            },
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (addressData: AddressData) => {
    try {
      const updated = [addressData, ...savedAddresses];
      await AsyncStorage.setItem('SAVED_ADDRESSES', JSON.stringify(updated));
      setSavedAddresses(updated);
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleSelectSavedAddress = (address: AddressData) => {
    setStreet(address.street);
    setPincode(address.pincode);
    setCity(address.city);
    setState(address.state);
    setPincodeData({
      pincode: address.pincode,
      city: address.city,
      state: address.state,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setShowSaved(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[globalStyles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }}
      >
        {/* Header */}
        <View style={premiumStyles.sectionHeader}>
          <Text style={premiumStyles.sectionTitle}>📍 Delivery Address</Text>
          <Text style={premiumStyles.sectionSubtitle}>
            Enter your address to find nearby products
          </Text>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
          {/* Saved Addresses Button */}
          {savedAddresses.length > 0 && (
            <TouchableOpacity
              style={[
                premiumStyles.addressContainer,
                showSaved ? premiumStyles.addressContainerActive : {},
              ]}
              onPress={() => setShowSaved(!showSaved)}
            >
              <Text style={premiumStyles.addressLabel}>
                📚 Saved Addresses ({savedAddresses.length})
              </Text>
            </TouchableOpacity>
          )}

          {/* Saved Addresses List */}
          {showSaved && (
            <FlatList
              data={savedAddresses}
              keyExtractor={(_, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    premiumStyles.addressContainer,
                    { marginBottom: spacing.md },
                  ]}
                  onPress={() => handleSelectSavedAddress(item)}
                >
                  <Text
                    style={[
                      premiumStyles.addressLabel,
                      { color: colors.primary, marginBottom: spacing.xs },
                    ]}
                  >
                    {item.fullAddress}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {item.city}, {item.state}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Address Form */}
          <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
            {/* Street Address */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={premiumStyles.addressLabel}>
                Street Address <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <TextInput
                style={[
                  globalStyles.input,
                  errors.street ? { borderColor: colors.error } : {},
                ]}
                placeholder="Enter house no., building name, street"
                placeholderTextColor={colors.textSecondary}
                value={street}
                onChangeText={setStreet}
                editable={!loading}
                multiline
                numberOfLines={3}
              />
              {errors.street && (
                <Text style={[globalStyles.errorText, { marginTop: spacing.xs }]}>
                  {errors.street}
                </Text>
              )}
            </View>

            {/* Pincode Search */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={premiumStyles.addressLabel}>
                Pincode <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TextInput
                  style={[
                    globalStyles.input,
                    { flex: 1, marginBottom: 0 },
                    errors.pincode ? { borderColor: colors.error } : {},
                  ]}
                  placeholder="e.g., 110001"
                  placeholderTextColor={colors.textSecondary}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  editable={!loading && !searching}
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[
                    globalStyles.button,
                    {
                      backgroundColor: colors.primary,
                      marginBottom: spacing.lg,
                      marginTop: 0,
                      paddingHorizontal: spacing.lg,
                    },
                    (searching || loading) && { opacity: 0.6 },
                  ]}
                  onPress={searchPincode}
                  disabled={searching || loading}
                >
                  {searching ? (
                    <ActivityIndicator color={colors.background} size="small" />
                  ) : (
                    <Text style={[globalStyles.buttonText, { color: colors.background }]}>
                      Search
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {errors.pincode && (
                <Text style={[globalStyles.errorText, { marginTop: spacing.xs }]}>
                  {errors.pincode}
                </Text>
              )}
              {pincodeData && (
                <Text style={{ color: colors.success, fontSize: 12, marginTop: spacing.sm }}>
                  ✓ {pincodeData.city}, {pincodeData.state}
                </Text>
              )}
            </View>

            {/* City */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={premiumStyles.addressLabel}>City/District</Text>
              <TextInput
                style={[globalStyles.input, { color: colors.textSecondary }]}
                placeholder="Auto-filled from pincode"
                placeholderTextColor={colors.textSecondary}
                value={city}
                onChangeText={setCity}
                editable={!pincodeData}
              />
            </View>

            {/* State */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={premiumStyles.addressLabel}>State</Text>
              <TextInput
                style={[globalStyles.input, { color: colors.textSecondary }]}
                placeholder="Auto-filled from pincode"
                placeholderTextColor={colors.textSecondary}
                value={state}
                onChangeText={setState}
                editable={!pincodeData}
              />
            </View>
          </View>
        </View>

        {/* Footer Buttons */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.lg,
            gap: spacing.md,
          }}
        >
          <TouchableOpacity
            style={[
              globalStyles.button,
              { backgroundColor: colors.primary, width: '100%' },
              (loading || !pincodeData) && { opacity: 0.6 },
            ]}
            onPress={handleSubmitAddress}
            disabled={loading || !pincodeData}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[globalStyles.buttonText, { color: colors.background }]}>
                Confirm Address
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={[globalStyles.buttonText, { color: colors.text }]}>
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddressInputScreen;
