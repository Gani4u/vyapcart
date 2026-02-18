// /src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import { signOut, getAuth } from '@react-native-firebase/auth';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { registerWithEmail } from '../services/firebaseAuth.service';
import { saveRegistrationData } from '../services/token.service';

export default function RegisterScreen({ navigation }: any) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (emailToValidate: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
  };

  const validatePhone = (phoneToValidate: string) => {
    return /^[0-9]{10}$/.test(phoneToValidate);
  };

  const validateGST = (gst: string) => {
    if (!gst) return true; // GST is optional
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/.test(gst);
  };

  const onRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Full name is required');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Validation Error', 'Valid email is required');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    if (!phone || !validatePhone(phone)) {
      Alert.alert('Validation Error', 'Phone must be 10 digits');
      return;
    }

    if (isSeller) {
      if (!businessName.trim()) {
        Alert.alert('Validation Error', 'Business name is required for sellers');
        return;
      }

      if (gstNumber && !validateGST(gstNumber)) {
        Alert.alert(
          'Validation Error',
          'Invalid GST format. Expected: 22AABCU1234A1Z5'
        );
        return;
      }
    }

    setLoading(true);
    try {
      const role = isSeller ? 'SELLER' : 'BUYER';

      // Step 1: Create Firebase account and send verification email
      await registerWithEmail(
        email,
        password,
        fullName,
        phone,
        role,
        isSeller ? businessName : undefined,
        isSeller ? gstNumber : undefined
      );

      // Step 2: Store registration data for later use during login
      // This way user won't need to re-enter seller details after email verification
      await saveRegistrationData({
        email,
        fullName,
        phone,
        role,
        businessName: isSeller ? businessName : undefined,
        gstNumber: isSeller ? gstNumber : undefined,
        timestamp: Date.now(),
      });

      // Step 3: Sign out and guide user to verify email
      const auth = getAuth();
      await signOut(auth).catch(() => {});

      Alert.alert(
        '✅ Account Created',
        `Verification email sent to ${email}.\n\nPlease verify your email before logging in.\n\nAfter verification, log in with your email and password.`,
        [
          {
            text: 'Go to Login',
            onPress: () => {
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={globalStyles.title}>Create Account</Text>

        {/* Full Name */}
        <TextInput
          style={globalStyles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          editable={!loading}
        />

        {/* Email */}
        <TextInput
          style={globalStyles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        {/* Password */}
        <TextInput
          style={globalStyles.input}
          placeholder="Password (min 6 characters)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {/* Confirm Password */}
        <TextInput
          style={globalStyles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        {/* Phone */}
        <TextInput
          style={globalStyles.input}
          placeholder="Phone (10 digits)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!loading}
        />

        {/* Seller Toggle */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginVertical: 15,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            Register as Seller?
          </Text>
          <Switch
            value={isSeller}
            onValueChange={setIsSeller}
            disabled={loading}
          />
        </View>

        {/* Seller-specific fields */}
        {isSeller && (
          <>
            <TextInput
              style={globalStyles.input}
              placeholder="Business Name *"
              value={businessName}
              onChangeText={setBusinessName}
              editable={!loading}
            />

            <TextInput
              style={globalStyles.input}
              placeholder="GST Number (optional)"
              value={gstNumber}
              onChangeText={setGstNumber}
              autoCapitalize="characters"
              editable={!loading}
            />

            <Text style={{ paddingHorizontal: 20, color: '#666', fontSize: 12 }}>
              GST Format: 22AABCU1234A1Z5
            </Text>
          </>
        )}

        {/* Register Button */}
        <TouchableOpacity
          style={[globalStyles.button, { opacity: loading ? 0.6 : 1 }]}
          onPress={onRegister}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          disabled={loading}
        >
          <Text style={{ textAlign: 'center', color: '#007AFF', marginTop: 20 }}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
