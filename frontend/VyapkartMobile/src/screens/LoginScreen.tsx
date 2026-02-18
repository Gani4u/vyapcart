// /src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { loginWithEmail } from '../services/firebaseAuth.service';
import { saveToken, saveUserData, getRegistrationData, clearRegistrationData, RegistrationData } from '../services/token.service';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [showRegistrationDataBanner, setShowRegistrationDataBanner] = useState(false);

  useEffect(() => {
    // Check if there's stored registration data from a recent registration
    const checkStoredData = async () => {
      try {
        const stored = await getRegistrationData();
        if (stored) {
          setRegistrationData(stored);
          setEmail(stored.email);
          setShowRegistrationDataBanner(true);
        }
      } catch (error) {
        console.error('Error loading registration data:', error);
      } finally {
        setInitializing(false);
      }
    };

    checkStoredData();
  }, []);

  const validateEmail = (emailToValidate: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate);
  };

  const onLogin = async () => {
    // Basic validation
    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Validation Error', 'Valid email is required');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Password is required');
      return;
    }

    setLoading(true);
    try {
      let authData;

      // STEP 1: If we have registration data, use it for the first-time login
      // This way the user doesn't need to re-enter seller details after email verification
      if (registrationData && email === registrationData.email) {
        console.log('🔄 Using stored registration data for first-time login');
        authData = await loginWithEmail(
          email,
          password,
          registrationData.role,
          registrationData.businessName,
          registrationData.gstNumber,
          registrationData.fullName,
          registrationData.phone
        );

        // Clear registration data after successful first login
        await clearRegistrationData();
        setRegistrationData(null);
      } else {
        // STEP 2: Pure login (existing user or logging in as different email)
        authData = await loginWithEmail(email, password);
      }

      // STEP 3: Save JWT token
      await saveToken(authData.token);

      // STEP 4: Save user data (for UI and role-based navigation)
      await saveUserData({
        userId: authData.userId,
        email: authData.email,
        fullName: authData.fullName,
        phone: authData.phone,
        roles: authData.roles,
      });

      console.log('✅ Login successful');
      console.log('✅ User roles:', authData.roles);

      Alert.alert('Success', `Welcome ${authData.fullName || 'User'}!`);

      // Navigate to home - the AppNavigator will handle role-based navigation
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={globalStyles.container}>
        <Text style={globalStyles.title}>Login</Text>

        {/* ===== REGISTRATION DATA BANNER ===== */}
        {/* Show if user just registered and is logging in for the first time */}
        {showRegistrationDataBanner && registrationData && (
          <View
            style={{
              backgroundColor: '#E8F5E9',
              borderLeftWidth: 4,
              borderLeftColor: '#4CAF50',
              padding: 12,
              marginHorizontal: 20,
              marginVertical: 15,
              borderRadius: 4,
            }}
          >
            <Text style={{ fontSize: 14, color: '#2E7D32', fontWeight: '500' }}>
              ✅ Account created! Use your email to verify and login.
            </Text>
            {registrationData.role === 'SELLER' && (
              <Text style={{ fontSize: 12, color: '#2E7D32', marginTop: 4 }}>
                Your seller profile will be created after login.
              </Text>
            )}
          </View>
        )}

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
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!loading}
        />

        {/* Login Button */}
        <TouchableOpacity
          style={[globalStyles.button, { opacity: loading ? 0.6 : 1 }]}
          onPress={onLogin}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text style={{ textAlign: 'center', color: '#007AFF', marginTop: 20 }}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
