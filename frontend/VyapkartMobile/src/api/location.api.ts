// src/api/location.api.ts

import { apiClient } from './client';
import {
  SellerLocationRequest,
  SellerLocationResponse,
  PincodeResponse,
  NearbyProductResponse,
  LocationError,
} from '../types/location';

/**
 * Update seller location and delivery radius
 */
export const updateSellerLocation = async (
  locationData: SellerLocationRequest
): Promise<SellerLocationResponse> => {
  try {
    const response = await apiClient.put<SellerLocationResponse>(
      '/seller/location',
      locationData
    );
    return response.data;
  } catch (error: any) {
    throw parseLocationError(error);
  }
};

/**
 * Get current seller location
 */
export const getSellerLocation = async (): Promise<SellerLocationResponse> => {
  try {
    const response = await apiClient.get<SellerLocationResponse>(
      '/seller/location'
    );
    return response.data;
  } catch (error: any) {
    throw parseLocationError(error);
  }
};

/**
 * Lookup pincode details
 */
export const lookupPincode = async (
  pincode: string
): Promise<PincodeResponse> => {
  try {
    const response = await apiClient.get<PincodeResponse>(
      `/pincode/${pincode}`
    );
    return response.data;
  } catch (error: any) {
    throw parseLocationError(error);
  }
};

/**
 * Find nearby products within specified radius
 */
export const findNearbyProducts = async (
  latitude: number,
  longitude: number,
  radius: number
): Promise<NearbyProductResponse[]> => {
  try {
    const response = await apiClient.get<NearbyProductResponse[]>(
      '/catalog/products/nearby',
      {
        params: {
          lat: latitude,
          lng: longitude,
          radius: radius,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw parseLocationError(error);
  }
};

/**
 * Parse location API errors
 */
const parseLocationError = (error: any): LocationError => {
  if (error.response?.data) {
    return error.response.data;
  }

  if (error.message === 'Network Error') {
    return {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to server. Please check your internet connection.',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unexpected error occurred',
  };
};

export type { LocationError };
