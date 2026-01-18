import { apiClient } from './client';

export const getProducts = () => {
  return apiClient.get('/catalog/products');
};
