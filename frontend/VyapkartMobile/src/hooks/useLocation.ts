// src/hooks/useLocation.ts

import { useState, useCallback, useEffect } from 'react';
import {
  SellerLocationResponse,
  NearbyProductResponse,
  PincodeResponse,
  GeolocationPosition,
} from '../types/location';
import {
  updateSellerLocation,
  getSellerLocation,
  findNearbyProducts,
  lookupPincode,
} from '../api/location.api';
import LocationService from '../services/location.service';

interface UseLocationReturn {
  // Seller location
  sellerLocation: SellerLocationResponse | null;
  loadingSellerLocation: boolean;
  errorSellerLocation: string | null;
  fetchSellerLocation: () => Promise<void>;
  updateLocation: (lat: number, lng: number, radius: number) => Promise<void>;

  // Device location
  deviceLocation: GeolocationPosition | null;
  loadingDeviceLocation: boolean;
  errorDeviceLocation: string | null;
  requestDeviceLocation: () => Promise<void>;

  // Products
  products: NearbyProductResponse[];
  loadingProducts: boolean;
  errorProducts: string | null;
  searchNearbyProducts: (lat: number, lng: number, radius: number) => Promise<void>;

  // Pincode
  pincodeData: PincodeResponse | null;
  loadingPincode: boolean;
  errorPincode: string | null;
  searchPincode: (code: string) => Promise<void>;
}

/**
 * Custom hook for location-based operations
 */
export const useLocation = (): UseLocationReturn => {
  // Seller location state
  const [sellerLocation, setSellerLocation] = useState<SellerLocationResponse | null>(null);
  const [loadingSellerLocation, setLoadingSellerLocation] = useState(false);
  const [errorSellerLocation, setErrorSellerLocation] = useState<string | null>(null);

  // Device location state
  const [deviceLocation, setDeviceLocation] = useState<GeolocationPosition | null>(null);
  const [loadingDeviceLocation, setLoadingDeviceLocation] = useState(false);
  const [errorDeviceLocation, setErrorDeviceLocation] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<NearbyProductResponse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);

  // Pincode state
  const [pincodeData, setPincodeData] = useState<PincodeResponse | null>(null);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [errorPincode, setErrorPincode] = useState<string | null>(null);

  // Fetch seller location
  const fetchSellerLocation = useCallback(async () => {
    try {
      setLoadingSellerLocation(true);
      setErrorSellerLocation(null);
      const location = await getSellerLocation();
      setSellerLocation(location);
    } catch (error: any) {
      setErrorSellerLocation(error.message || 'Failed to fetch seller location');
    } finally {
      setLoadingSellerLocation(false);
    }
  }, []);

  // Update seller location
  const updateLocation = useCallback(
    async (lat: number, lng: number, radius: number) => {
      try {
        setLoadingSellerLocation(true);
        setErrorSellerLocation(null);
        const updated = await updateSellerLocation({
          latitude: lat,
          longitude: lng,
          deliveryRadiusKm: radius,
        });
        setSellerLocation(updated);
      } catch (error: any) {
        setErrorSellerLocation(error.message || 'Failed to update location');
        throw error;
      } finally {
        setLoadingSellerLocation(false);
      }
    },
    []
  );

  // Request device location
  const requestDeviceLocation = useCallback(async () => {
    try {
      setLoadingDeviceLocation(true);
      setErrorDeviceLocation(null);

      // Request permission first
      const hasPermission = await LocationService.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      // Get location
      const position = await LocationService.getCurrentLocation();
      setDeviceLocation(position);
    } catch (error: any) {
      setErrorDeviceLocation(error.message || 'Failed to get device location');
    } finally {
      setLoadingDeviceLocation(false);
    }
  }, []);

  // Search nearby products
  const searchNearbyProducts = useCallback(
    async (lat: number, lng: number, radius: number) => {
      try {
        setLoadingProducts(true);
        setErrorProducts(null);
        const nearbyProducts = await findNearbyProducts(lat, lng, radius);
        setProducts(nearbyProducts);
      } catch (error: any) {
        setErrorProducts(error.message || 'Failed to search products');
        throw error;
      } finally {
        setLoadingProducts(false);
      }
    },
    []
  );

  // Search pincode
  const searchPincode = useCallback(async (code: string) => {
    try {
      setLoadingPincode(true);
      setErrorPincode(null);
      const pincode = await lookupPincode(code);
      setPincodeData(pincode);
    } catch (error: any) {
      setErrorPincode(error.message || 'Failed to lookup pincode');
      throw error;
    } finally {
      setLoadingPincode(false);
    }
  }, []);

  return {
    // Seller location
    sellerLocation,
    loadingSellerLocation,
    errorSellerLocation,
    fetchSellerLocation,
    updateLocation,

    // Device location
    deviceLocation,
    loadingDeviceLocation,
    errorDeviceLocation,
    requestDeviceLocation,

    // Products
    products,
    loadingProducts,
    errorProducts,
    searchNearbyProducts,

    // Pincode
    pincodeData,
    loadingPincode,
    errorPincode,
    searchPincode,
  };
};

export default useLocation;
