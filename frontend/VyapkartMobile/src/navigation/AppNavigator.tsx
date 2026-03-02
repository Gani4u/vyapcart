// /src/navigation/AppNavigator.tsx
import React, { useEffect, useState, useRef } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getCurrentUser } from '../api/auth.api';
import HomeScreen from '../screens/HomeScreen';
import PincodeScreen from '../screens/PincodeScreen';
import NearbyProductsScreen from '../screens/NearbyProductsScreen';
import SellerLocationScreen from '../screens/SellerLocationScreen';
import SellerProductsScreen from '../screens/SellerProductsScreen';
import SellerDashboardScreen from '../screens/SellerDashboardScreen';
import SellerPendingApprovalScreen from '../screens/SellerPendingApprovalScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import AddressInputScreen from '../screens/AddressInputScreen';
import LocationOnboardingScreen from '../screens/LocationOnboardingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Buyer Navigation
function BuyerNavigator() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('location_onboarding_completed');
      setShowOnboarding(!hasSeenOnboarding);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setShowOnboarding(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      {showOnboarding && (
        <Stack.Screen
          name="LocationOnboarding"
          component={LocationOnboardingScreen}
          options={{
            headerShown: false,
          }}
        />
      )}
      <Stack.Screen
        name="BuyerTabs"
        component={BuyerTabsContent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddressInput"
        component={AddressInputScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function BuyerTabsContent() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="BuyerHome"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: '🏠 Home',
        }}
      />
      <Tab.Screen
        name="NearbyProducts"
        component={NearbyProductsScreen}
        options={{
          title: 'Discover Products',
          tabBarLabel: '🛍️ Products',
        }}
      />
      <Tab.Screen
        name="PincodeTab"
        component={PincodeScreen}
        options={{
          title: 'Pincode Lookup',
          tabBarLabel: '📍 Pincode',
        }}
      />
    </Tab.Navigator>
  );
}

// Seller Navigation
function SellerNavigator() {
  const [sellerApproved, setSellerApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      console.log('🎯 SellerNavigator focused: Starting approval status check');
      // Check approval status when screen comes into focus
      checkSellerApprovalStatus();

      // Start polling every 10 seconds while on this navigator
      console.log('⏱️ Starting polling interval every 10 seconds...');
      pollingIntervalRef.current = setInterval(() => {
        console.log('⏱️ Polling tick...');
        checkSellerApprovalStatusSilent();
      }, 10000);

      // Cleanup polling when screen loses focus
      return () => {
        console.log('👋 SellerNavigator unfocused: Stopping polling');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }, [])
  );

  const checkSellerApprovalStatus = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('USER_DATA');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const isApproved = userData.sellerStatus === 'APPROVED';
        console.log('🚀 Initial check: sellerStatus =', userData.sellerStatus, ', isApproved =', isApproved);
        setSellerApproved(isApproved);
      }
    } catch (error) {
      console.error('❌ Error checking seller approval:', error);
      setSellerApproved(false);
    } finally {
      setLoading(false);
    }
  };

  const checkSellerApprovalStatusSilent = async () => {
    try {
      // Fetch current user info from backend
      const response = await getCurrentUser();
      console.log('🔍 Poll: GET /users/me response:', response.data);
      
      if (response.data) {
        const newSellerStatus = response.data.sellerStatus;
        console.log('🔍 Poll: New seller status from backend:', newSellerStatus);
        
        // Update AsyncStorage with latest status from backend
        const userDataString = await AsyncStorage.getItem('USER_DATA');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const oldStatus = userData.sellerStatus;
          console.log('🔍 Poll: Old status from AsyncStorage:', oldStatus);
          
          // If seller status changed to APPROVED, update AsyncStorage and state
          if (newSellerStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
            console.log('✅ APPROVED! Status changed from', oldStatus, 'to', newSellerStatus);
            userData.sellerStatus = newSellerStatus;
            await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
            setSellerApproved(true);
          } else if (newSellerStatus !== 'APPROVED' && sellerApproved) {
            // If status reverted from APPROVED to something else, update state
            console.log('⚠️ Status changed back to:', newSellerStatus);
            userData.sellerStatus = newSellerStatus;
            await AsyncStorage.setItem('USER_DATA', JSON.stringify(userData));
            setSellerApproved(false);
          }
        }
      }
    } catch (error: any) {
      console.log('🔍 Poll: API call failed (this is expected if server is down)');
      console.log('Error details:', error.message || error);
      
      // Fall back to checking AsyncStorage if API fails
      try {
        const userDataString = await AsyncStorage.getItem('USER_DATA');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const isApproved = userData.sellerStatus === 'APPROVED';
          console.log('🔄 Fallback: Checking AsyncStorage, isApproved:', isApproved);
          
          if (isApproved && !sellerApproved) {
            console.log('✅ Seller approval status detected from AsyncStorage!');
            setSellerApproved(true);
          }
        }
      } catch (fallbackError) {
        console.error('🔴 Fallback check error:', fallbackError);
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // If seller is not approved, show pending approval screen
  if (!sellerApproved) {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="SellerPendingApproval"
          component={SellerPendingApprovalScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  // If seller is approved, show full seller app
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="SellerTabs"
        component={SellerTabsContent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={{
          title: 'Product Form',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="AddressInput"
        component={AddressInputScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}

function SellerTabsContent() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="SellerHome"
        component={SellerDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: '📊 Dashboard',
        }}
      />
      <Tab.Screen
        name="SellerProducts"
        component={SellerProductsScreen}
        options={{
          title: 'Products',
          tabBarLabel: '📦 Products',
        }}
      />
      <Tab.Screen
        name="SellerLocation"
        component={SellerLocationScreen}
        options={{
          title: 'Store Location',
          tabBarLabel: '📍 Location',
        }}
      />
      <Tab.Screen
        name="PincodeTab"
        component={PincodeScreen}
        options={{
          title: 'Pincode Info',
          tabBarLabel: '🗺️ Pincode',
        }}
      />
    </Tab.Navigator>
  );
}

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

  const isSeller = userRole.includes('SELLER');

  return isSeller ? <SellerNavigator /> : <BuyerNavigator />;
}

