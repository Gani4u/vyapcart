// src/screens/NearbyProductsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { findNearbyProducts } from '../api/location.api';
import { NearbyProductResponse } from '../types/location';
import { globalStyles } from '../styles/globalStyles';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { premiumStyles, designSystem } from '../styles/designSystem';
import { PremiumProductCard } from '../components/PremiumProductCard';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { LocationPermissionDialog } from '../components/LocationPermissionDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
  route?: any;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  radius: number;
}

const NearbyProductsScreen: React.FC<Props> = ({ navigation, route }) => {
  const [products, setProducts] = useState<NearbyProductResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'nearest' | 'cheapest'>('all');

  const {
    permissionDialogVisible,
    requestLocation,
    handlePrecisePermission,
    handleApproximatePermission,
    handleDenyPermission,
    handleOpenSettings,
    isBlocked,
    loading: permLoading,
  } = useLocationPermission();

  // Initialize with route params or request location
  useEffect(() => {
    initializeLocation();
  }, []);

  // Search products when location data changes
  useEffect(() => {
    if (locationData) {
      searchProducts();
    }
  }, [locationData]);

  const initializeLocation = async () => {
    try {
      // Check if coming from AddressInputScreen
      if (route?.params?.latitude && route?.params?.longitude) {
        const location: LocationData = {
          latitude: route.params.latitude,
          longitude: route.params.longitude,
          address: route.params.address,
          radius: route.params.radius || 10,
        };
        setLocationData(location);
        return;
      }

      // Try to get saved location from storage
      const saved = await AsyncStorage.getItem('LAST_LOCATION');
      if (saved) {
        setLocationData(JSON.parse(saved));
        return;
      }

      // Request device location
      requestLocation((position) => {
        const location: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius: 10,
        };
        setLocationData(location);
      });
    } catch (error) {
      console.error('Error initializing location:', error);
      // Fallback to address input
      navigation.navigate('AddressInput');
    }
  };

  const searchProducts = async () => {
    if (!locationData) return;

    setLoading(true);
    try {
      const nearby = await findNearbyProducts(
        locationData.latitude,
        locationData.longitude,
        locationData.radius
      );

      // Sort based on filter
      let sortedProducts = [...nearby];
      if (selectedFilter === 'nearest') {
        sortedProducts.sort((a, b) => a.distance - b.distance);
      } else if (selectedFilter === 'cheapest') {
        sortedProducts.sort((a, b) => a.price - b.price);
      }

      setProducts(sortedProducts);

      // Save location for next time
      await AsyncStorage.setItem('LAST_LOCATION', JSON.stringify(locationData));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      searchProducts();
      setRefreshing(false);
    }, 1000);
  };

  const handleAddToCart = (productId: number) => {
    Alert.alert('Added to Cart', `Product #${productId} added to cart!`);
  };

  const handleChangeLocation = () => {
    navigation.navigate('AddressInput');
  };

  const renderHeader = () => (
    <View>
      {/* Header Section */}
      <View style={premiumStyles.headerContainer}>
        <Text style={premiumStyles.headerTitle}>Discover Products</Text>
        <Text style={premiumStyles.headerSubtitle}>
          {locationData?.address || 'Near you'}
        </Text>
      </View>

      {/* Location Info Card */}
      <View
        style={{
          marginHorizontal: spacing.lg,
          marginVertical: spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.primaryLight,
          borderRadius: designSystem.radius.lg,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
            📍 Search Radius: {locationData?.radius || 10} km
          </Text>
          <Text style={{ fontSize: 11, color: colors.primary, marginTop: 2 }}>
            Found {products.length} product{products.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            backgroundColor: colors.primary,
            borderRadius: designSystem.radius.md,
          }}
          onPress={handleChangeLocation}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={premiumStyles.filterChipsContainer}>
        {(['all', 'nearest', 'cheapest'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              premiumStyles.filterChip,
              selectedFilter === filter && premiumStyles.filterChipActive,
            ]}
            onPress={() => {
              setSelectedFilter(filter);
              // Re-sort products
              let sorted = [...products];
              if (filter === 'nearest') {
                sorted.sort((a, b) => a.distance - b.distance);
              } else if (filter === 'cheapest') {
                sorted.sort((a, b) => a.price - b.price);
              }
              setProducts(sorted);
            }}
          >
            <Text
              style={[
                premiumStyles.filterChipText,
                selectedFilter === filter && premiumStyles.filterChipTextActive,
              ]}
            >
              {filter === 'all' && '🔄 All'}
              {filter === 'nearest' && '📍 Nearest'}
              {filter === 'cheapest' && '💰 Cheapest'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={premiumStyles.productListEmpty}>
      <Text style={{ fontSize: 48, marginBottom: spacing.md }}>📦</Text>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: spacing.sm,
        }}
      >
        No Products Found
      </Text>
      <Text style={premiumStyles.productListEmptyText}>
        Try increasing the search radius or changing location
      </Text>
      <TouchableOpacity
        style={{
          marginTop: spacing.xl,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          backgroundColor: colors.primary,
          borderRadius: designSystem.radius.lg,
        }}
        onPress={handleChangeLocation}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Change Location</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProduct = ({ item, index }: { item: NearbyProductResponse; index: number }) => (
    <PremiumProductCard
      productId={item.productId}
      name={item.name}
      businessName={item.businessName}
      price={item.price}
      distance={item.distance}
      onAddToCart={() => handleAddToCart(item.productId)}
      badge={index < 3 ? '⭐ Top Pick' : undefined}
    />
  );

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[globalStyles.text, { marginTop: spacing.lg }]}>
            Loading nearby products...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[globalStyles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: spacing.lg, justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmptyState}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        scrollIndicatorInsets={{ right: 1 }}
      />

      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        visible={permissionDialogVisible}
        appName="Vyapkart"
        onPrecisePermission={handlePrecisePermission}
        onApproximatePermission={handleApproximatePermission}
        onDeny={handleDenyPermission}
        onOpenSettings={handleOpenSettings}
        loading={permLoading}
        isBlocked={isBlocked}
      />
    </SafeAreaView>
  );
};

export default NearbyProductsScreen;
