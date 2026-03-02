// /src/api/seller.api.ts
import { apiClient } from './client';

export interface SKU {
  id?: number;
  skuCode: string;
  price: number;
}

export interface Product {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  createdAt?: string;
  skus: SKU[];
}

// Location APIs
export const updateSellerLocation = (data: {
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
}) => {
  return apiClient.put('/seller/location', data);
};

export const getSellerLocation = () => {
  return apiClient.get('/seller/location');
};

// Product APIs
export const createProduct = (product: Product) => {
  return apiClient.post('/seller/products', {
    name: product.name,
    description: product.description || '',
    skus: product.skus,
  });
};

export const getSellerProducts = () => {
  return apiClient.get('/seller/products');
};

export const getProduct = (productId: number) => {
  return apiClient.get(`/seller/products/${productId}`);
};

export const updateProduct = (productId: number, product: Product) => {
  return apiClient.put(`/seller/products/${productId}`, {
    name: product.name,
    description: product.description || '',
    skus: product.skus,
  });
};

export const deleteProduct = (productId: number) => {
  return apiClient.delete(`/seller/products/${productId}`);
};
