// /src/navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [userRole, setUserRole] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('USER_DATA');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserRole(userData.roles || []);
      }
    } catch (error) {
      console.error('Failed to load user role:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Determine which home screen to show based on role
  const isSeller = userRole.includes('SELLER');

  return (
    <Stack.Navigator
      screenOptions={{
        title: 'Vyapkart',
      }}
    >
      {isSeller ? (
        <Stack.Screen
          name="SellerHome"
          component={HomeScreen}
          options={{
            title: 'Seller Dashboard',
          }}
        />
      ) : (
        <Stack.Screen
          name="BuyerHome"
          component={HomeScreen}
          options={{
            title: 'Browse Products',
          }}
        />
      )}

      {/* Common screens for both buyer and seller */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Vyapkart',
        }}
      />
    </Stack.Navigator>
  );
}
