// src/screens/PincodeScreen.tsx

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
} from 'react-native';
import { lookupPincode } from '../api/location.api';
import { PincodeResponse } from '../types/location';
import { isValidPincode, formatCoordinates } from '../utils/locationValidation';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

const PincodeScreen: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    const trimmedPincode = pincode.trim();

    // Validation
    if (!trimmedPincode) {
      setError('Please enter a pincode');
      return;
    }

    if (!isValidPincode(trimmedPincode)) {
      setError('Pincode must be exactly 6 digits');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const pincodeData = await lookupPincode(trimmedPincode);
      setResult(pincodeData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to lookup pincode';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPincode('');
    setResult(null);
    setError(null);
  };

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
        <View style={{ marginBottom: spacing.xl }}>
          <Text style={[globalStyles.heading, { color: colors.primary }]}>
            Pincode Lookup
          </Text>
          <Text style={[globalStyles.label, { marginTop: spacing.sm, color: colors.textSecondary }]}>
            Find city, state, and location by pincode
          </Text>
        </View>

        {/* Input Section */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[globalStyles.label, { marginBottom: spacing.sm }]}>
            Enter Pincode (6 digits)
          </Text>
          <TextInput
            style={[
              globalStyles.input,
              error ? { borderColor: colors.error } : { borderColor: colors.border },
            ]}
            placeholder="e.g., 110001"
            placeholderTextColor={colors.textSecondary}
            value={pincode}
            onChangeText={(text) => {
              setPincode(text.replace(/[^0-9]/g, ''));
              setError(null);
            }}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
          />
          {error && (
            <Text style={[globalStyles.errorText, { marginTop: spacing.xs }]}>
              {error}
            </Text>
          )}
        </View>

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
          <TouchableOpacity
            style={[
              globalStyles.button,
              { flex: 1, backgroundColor: colors.primary },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleLookup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={[globalStyles.buttonText, { color: colors.background }]}>
                Search
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.button, { flex: 1, backgroundColor: colors.border }]}
            onPress={handleClear}
            disabled={loading}
          >
            <Text style={[globalStyles.buttonText, { color: colors.text }]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>

        {/* Result Section */}
        {result && (
          <View
            style={{
              backgroundColor: colors.surfaceAlt,
              borderRadius: 8,
              padding: spacing.lg,
              borderLeftWidth: 4,
              borderLeftColor: colors.success,
            }}
          >
            <Text style={[globalStyles.heading, { marginBottom: spacing.md, fontSize: 18 }]}>
              ✓ Pincode Details
            </Text>

            <DetailRow label="Pincode" value={result.pincode} />
            <DetailRow label="City" value={result.city} />
            <DetailRow label="State" value={result.state} />
            <DetailRow
              label="Coordinates"
              value={formatCoordinates(result.latitude, result.longitude)}
            />
            <DetailRow label="Latitude" value={result.latitude.toFixed(6)} />
            <DetailRow label="Longitude" value={result.longitude.toFixed(6)} />
          </View>
        )}

        {/* Info Section */}
        {!result && (
          <View style={{ backgroundColor: colors.infoBg, padding: spacing.lg, borderRadius: 8 }}>
            <Text style={[globalStyles.label, { color: colors.info, marginBottom: spacing.sm }]}>
              💡 How it works
            </Text>
            <Text style={{ color: colors.info, lineHeight: 20 }}>
              Enter any 6-digit Indian pincode to get the city, state, and exact coordinates
              (latitude/longitude).{'\n\n'}This information can be used to find nearby products or
              set your delivery location.
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <View style={{ marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
    <Text style={[globalStyles.label, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
      {label}
    </Text>
    <Text style={[globalStyles.text, { color: colors.text, fontSize: 16, fontWeight: '600' }]}>
      {value}
    </Text>
  </View>
);

export default PincodeScreen;
