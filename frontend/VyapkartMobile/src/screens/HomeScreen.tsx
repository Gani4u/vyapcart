// /src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout } from '../services/firebaseAuth.service';
import { getToken } from '../services/token.service';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
}

interface UserData {
  email: string;
  fullName?: string;
  roles?: string[];
}

export default function HomeScreen({ navigation }: Props) {
  const [userRole, setUserRole] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('USER_DATA');
      const token = await getToken();
      
      if (userDataString) {
        const data = JSON.parse(userDataString);
        setUserData(data);
        setUserRole(data.roles || []);
      }

      console.log('📦 Stored JWT:', token);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSeller = userRole.includes('SELLER');
  const isBuyer = userRole.includes('BUYER');

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => logout(),
        style: 'destructive',
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          globalStyles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[globalStyles.text, { marginTop: spacing.md }]}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[globalStyles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >
      {/* Header */}
      <View style={{ padding: spacing.lg, backgroundColor: colors.primary }}>
        <Text style={[globalStyles.heading, { color: colors.background, fontSize: 24 }]}>
          🏪 Vyapkart
        </Text>
        <Text style={[globalStyles.text, { color: colors.background, marginTop: spacing.sm }]}>
          Welcome {userData?.fullName || userData?.email}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            marginTop: spacing.md,
            gap: spacing.sm,
            flexWrap: 'wrap',
          }}
        >
          {isSeller && (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                👨‍💼 Seller
              </Text>
            </View>
          )}
          {isBuyer && (
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                🛒 Buyer
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={{ padding: spacing.lg }}>
        {/* Buyer Section */}
        {isBuyer && (
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              style={[
                globalStyles.label,
                {
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: spacing.lg,
                  color: colors.text,
                },
              ]}
            >
              🛍️ Shopping Features
            </Text>

            <TouchableOpacity
              style={[
                globalStyles.button,
                {
                  backgroundColor: colors.primary,
                  marginBottom: spacing.md,
                  padding: spacing.lg,
                },
              ]}
              onPress={() => navigation.navigate('NearbyProducts')}
            >
              <Text
                style={[
                  globalStyles.buttonText,
                  { color: colors.background, textAlign: 'left', fontSize: 16 },
                ]}
              >
                🏪 Find Nearby Products
              </Text>
              <Text
                style={{
                  color: colors.background,
                  fontSize: 12,
                  marginTop: spacing.xs,
                  opacity: 0.7,
                }}
              >
                Discover products available near your location
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                globalStyles.button,
                {
                  backgroundColor: colors.success,
                  marginBottom: spacing.md,
                  padding: spacing.lg,
                },
              ]}
              onPress={() => navigation.navigate('PincodeTab')}
            >
              <Text
                style={[
                  globalStyles.buttonText,
                  { color: colors.background, textAlign: 'left', fontSize: 16 },
                ]}
              >
                📍 Pincode Lookup
              </Text>
              <Text
                style={{
                  color: colors.background,
                  fontSize: 12,
                  marginTop: spacing.xs,
                  opacity: 0.7,
                }}
              >
                Find city and location details by pincode
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seller Section */}
        {isSeller && (
          <View style={{ marginBottom: spacing.xl }}>
            <Text
              style={[
                globalStyles.label,
                {
                  fontSize: 16,
                  fontWeight: '600',
                  marginBottom: spacing.lg,
                  color: colors.text,
                },
              ]}
            >
              📊 Seller Dashboard
            </Text>

            <TouchableOpacity
              style={[
                globalStyles.button,
                {
                  backgroundColor: colors.primary,
                  marginBottom: spacing.md,
                  padding: spacing.lg,
                },
              ]}
              onPress={() => navigation.navigate('SellerLocation')}
            >
              <Text
                style={[
                  globalStyles.buttonText,
                  { color: colors.background, textAlign: 'left', fontSize: 16 },
                ]}
              >
                📍 Store Location Setup
              </Text>
              <Text
                style={{
                  color: colors.background,
                  fontSize: 12,
                  marginTop: spacing.xs,
                  opacity: 0.7,
                }}
              >
                Set your store location and delivery radius
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                globalStyles.button,
                {
                  backgroundColor: colors.info,
                  marginBottom: spacing.md,
                  padding: spacing.lg,
                },
              ]}
              onPress={() => navigation.navigate('PincodeTab')}
            >
              <Text
                style={[
                  globalStyles.buttonText,
                  { color: colors.background, textAlign: 'left', fontSize: 16 },
                ]}
              >
                📋 Pincode Reference
              </Text>
              <Text
                style={{
                  color: colors.background,
                  fontSize: 12,
                  marginTop: spacing.xs,
                  opacity: 0.7,
                }}
              >
                Look up city and location information
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* General Section */}
        <View>
          <Text
            style={[
              globalStyles.label,
              {
                fontSize: 16,
                fontWeight: '600',
                marginBottom: spacing.lg,
                color: colors.text,
              },
            ]}
          >
            ⚙️ Account
          </Text>

          <TouchableOpacity
            style={[
              globalStyles.button,
              {
                backgroundColor: colors.error,
                padding: spacing.lg,
              },
            ]}
            onPress={handleLogout}
          >
            <Text
              style={[globalStyles.buttonText, { color: colors.background, fontSize: 16 }]}
            >
              🚪 Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Card */}
      <View
        style={{
          margin: spacing.lg,
          padding: spacing.lg,
          backgroundColor: colors.infoBg,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.info,
        }}
      >
        <Text style={[globalStyles.label, { color: colors.info, marginBottom: spacing.sm }]}>
          💡 About Vyapkart
        </Text>
        <Text style={{ color: colors.info, fontSize: 13, lineHeight: 20 }}>
          Your personal marketplace app. Browse, sell, and discover products nearby with our
          location-based features.
        </Text>
      </View>
    </ScrollView>
  );
}
