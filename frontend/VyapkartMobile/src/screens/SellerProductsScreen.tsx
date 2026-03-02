// src/screens/SellerProductsScreen.tsx
// Seller's product management screen with list view

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import * as sellerAPI from '../api/seller.api';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
}

interface ProductItem {
  id: number;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  skus: Array<{
    id: number;
    skuCode: string;
    price: number;
  }>;
}

const SellerProductsScreen: React.FC<Props> = ({ navigation }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load products when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await sellerAPI.getSellerProducts();
      setProducts(response.data.products || []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to load products';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await sellerAPI.getSellerProducts();
      setProducts(response.data.products || []);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to refresh products';
      Alert.alert('Error', message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProduct = (productId: number) => {
    navigation.navigate('ProductForm', { productId });
  };

  const handleDeleteProduct = (productId: number) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await sellerAPI.deleteProduct(productId);
              setProducts(products.filter(p => p.id !== productId));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error: any) {
              const message = error.response?.data?.message || 'Failed to delete product';
              Alert.alert('Error', message);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderProductCard = ({ item }: { item: ProductItem }) => (
    <View style={styles.productCard}>
      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* SKUs */}
        <View style={styles.skuSection}>
          <Text style={styles.skuCountLabel}>
            📦 {item.skus.length} SKU{item.skus.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Price Range */}
        {item.skus.length > 0 && (
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price Range:</Text>
            <View style={styles.priceList}>
              {item.skus.map((sku, index) => (
                <Text key={sku.id} style={styles.priceItem}>
                  {sku.skuCode}: ₹{sku.price.toFixed(2)}
                  {index < item.skus.length - 1 ? ' • ' : ''}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={[styles.statusText, item.status === 'ACTIVE' && styles.statusActive]}>
            ● {item.status}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditProduct(item.id)}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Products Yet</Text>
      <Text style={styles.emptyDescription}>
        Add your first product to get started selling
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('ProductForm')}
      >
        <Text style={styles.emptyButtonText}>+ Add Product</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Your Products</Text>
          <Text style={styles.headerSubtitle}>
            {products.length} product{products.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ProductForm')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          scrollEventThrottle={16}
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // List
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  // Product Card
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productInfo: {
    marginBottom: spacing.md,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  productDescription: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: spacing.md,
    lineHeight: 18,
  },

  // SKU Section
  skuSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skuCountLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },

  // Price Section
  priceSection: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  priceList: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  priceItem: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.success,
  },

  // Status Badge
  statusBadge: {
    marginBottom: spacing.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  statusActive: {
    color: colors.success,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.info,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: 8,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SellerProductsScreen;
