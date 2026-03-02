// src/navigation/LocationNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PincodeScreen from '../screens/PincodeScreen';
import SellerLocationScreen from '../screens/SellerLocationScreen';
import NearbyProductsScreen from '../screens/NearbyProductsScreen';
import { colors } from '../styles/colors';

const Stack = createNativeStackNavigator();

const LocationNavigator: React.FC = () => {
  const screenOpts: any = {
    headerStyle: {
      backgroundColor: colors.primary,
    },
    headerTintColor: colors.background,
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
    cardStyle: { backgroundColor: colors.background },
  };

  return (
    <Stack.Navigator
      screenOptions={screenOpts}
    >
      <Stack.Screen
        name="PincodeScreen"
        component={PincodeScreen}
        options={{
          title: 'Pincode Lookup',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="SellerLocationScreen"
        component={SellerLocationScreen}
        options={{
          title: 'Store Location Setup',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="NearbyProductsScreen"
        component={NearbyProductsScreen}
        options={{
          title: 'Discover Products',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
};

export default LocationNavigator;
