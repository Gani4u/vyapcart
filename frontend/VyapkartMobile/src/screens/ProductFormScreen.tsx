// src/screens/ProductFormScreen.tsx
// Beautiful product form for sellers to add/edit products with SKUs

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import * as sellerAPI from '../api/seller.api';

type NavigationProp = NativeStackNavigationProp<any, any>;
type RoutePropType = RouteProp<any, any>;

interface Props {
  navigation: NavigationProp;
  route: RoutePropType;
}

interface SKU {
  id?: number;
  skuCode: string;
  price: string;
}

const ProductFormScreen: React.FC<Props> = ({ navigation, route }) => {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [skus, setSkus] = useState<SKU[]>([{ skuCode: '', price: '' }]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  useEffect(() => {
    // If coming from edit, load existing product
    if (route.params?.productId) {
      loadProduct(route.params.productId);
    }
  }, [route.params?.productId]);

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true);
      const response = await sellerAPI.getProduct(productId);
      const product = response.data.data;

      setEditingProductId(productId);
      setProductName(product.name);
      setDescription(product.description || '');
      
      if (product.skus && product.skus.length > 0) {
        setSkus(product.skus.map((sku: any) => ({
          id: sku.id,
          skuCode: sku.skuCode,
          price: sku.price.toString(),
        })));
      }
      setIsEditing(true);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load product');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleAddSKU = () => {
    setSkus([...skus, { skuCode: '', price: '' }]);
  };

  const handleRemoveSKU = (index: number) => {
    if (skus.length <= 1) {
      Alert.alert('Error', 'At least one SKU is required');
      return;
    }
    setSkus(skus.filter((_, i) => i !== index));
  };

  const handleSKUChange = (index: number, field: 'skuCode' | 'price', value: string) => {
    const updatedSkus = [...skus];
    updatedSkus[index][field] = value;
    setSkus(updatedSkus);
  };

  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }

    for (let i = 0; i < skus.length; i++) {
      const sku = skus[i];
      if (!sku.skuCode.trim()) {
        Alert.alert('Error', `SKU code is required for item ${i + 1}`);
        return false;
      }
      if (!sku.price.trim()) {
        Alert.alert('Error', `Price is required for SKU ${sku.skuCode}`);
        return false;
      }
      const price = parseFloat(sku.price);
      if (isNaN(price) || price <= 0) {
        Alert.alert('Error', `Price for SKU ${sku.skuCode} must be a valid positive number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const productData = {
        name: productName.trim(),
        description: description.trim(),
        skus: skus.map(sku => ({
          skuCode: sku.skuCode.trim(),
          price: parseFloat(sku.price),
        })),
      };

      if (isEditing && editingProductId) {
        await sellerAPI.updateProduct(editingProductId, productData);
        Alert.alert('Success', 'Product updated successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        await sellerAPI.createProduct(productData);
        Alert.alert('Success', 'Product created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to save product';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
          <Text style={styles.headerSubtitle}>
            Fill in the product details and pricing
          </Text>
        </View>

        {/* Product Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Whole Wheat Bread"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor={colors.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Add product details..."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={colors.textLight}
              multiline={true}
              numberOfLines={4}
            />
          </View>
        </View>

        {/* SKUs Section */}
        <View style={styles.section}>
          <View style={styles.skuHeaderContainer}>
            <Text style={styles.sectionTitle}>Pricing & SKUs *</Text>
            <TouchableOpacity
              style={styles.addSKUButton}
              onPress={handleAddSKU}
            >
              <Text style={styles.addSKUButtonText}>+ Add SKU</Text>
            </TouchableOpacity>
          </View>

          {skus.map((sku, index) => (
            <View key={index} style={styles.skuCard}>
              <View style={styles.skuHeader}>
                <Text style={styles.skuNumber}>SKU {index + 1}</Text>
                {skus.length > 1 && (
                  <TouchableOpacity onPress={() => handleRemoveSKU(index)}>
                    <Text style={styles.removeSKUButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.skuContent}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>SKU Code *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., SKU-001"
                    value={sku.skuCode}
                    onChangeText={(value) => handleSKUChange(index, 'skuCode', value)}
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 50.00"
                    value={sku.price}
                    onChangeText={(value) => handleSKUChange(index, 'price', value)}
                    placeholderTextColor={colors.textLight}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          ))}

          <Text style={styles.helpText}>
            💡 You can add multiple SKUs for different variants or sizes
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.buttonDisabled]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Product' : 'Create Product'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Header
  header: {
    marginBottom: spacing['2xl'],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
  },

  // Section
  section: {
    marginBottom: spacing['2xl'],
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },

  // Form Group
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // SKU Section
  skuHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addSKUButton: {
    backgroundColor: colors.info,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
  },
  addSKUButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // SKU Card
  skuCard: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skuNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  removeSKUButton: {
    fontSize: 20,
    color: colors.danger,
    fontWeight: 'bold',
  },
  skuContent: {
    gap: 0,
  },

  // Help Text
  helpText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },

  // Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing['2xl'],
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ProductFormScreen;
