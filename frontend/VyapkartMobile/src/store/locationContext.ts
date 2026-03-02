// src/store/locationContext.ts

import React, { createContext } from 'react';
import {
  SellerLocationResponse,
  NearbyProductResponse,
  PincodeResponse,
  GeolocationPosition,
} from '../types/location';

export interface LocationContextType {
  // Seller location
  sellerLocation: SellerLocationResponse | null;
  loadingSellerLocation: boolean;
  errorSellerLocation: string | null;
  setSellerLocation: (location: SellerLocationResponse | null) => void;
  setLoadingSellerLocation: (loading: boolean) => void;
  setErrorSellerLocation: (error: string | null) => void;

  // Device location
  deviceLocation: GeolocationPosition | null;
  loadingDeviceLocation: boolean;
  errorDeviceLocation: string | null;
  setDeviceLocation: (location: GeolocationPosition | null) => void;
  setLoadingDeviceLocation: (loading: boolean) => void;
  setErrorDeviceLocation: (error: string | null) => void;

  // Nearby products
  nearbyProducts: NearbyProductResponse[];
  loadingNearbyProducts: boolean;
  errorNearbyProducts: string | null;
  setNearbyProducts: (products: NearbyProductResponse[]) => void;
  setLoadingNearbyProducts: (loading: boolean) => void;
  setErrorNearbyProducts: (error: string | null) => void;

  // Pincode
  pincodeData: PincodeResponse | null;
  loadingPincode: boolean;
  errorPincode: string | null;
  setPincodeData: (data: PincodeResponse | null) => void;
  setLoadingPincode: (loading: boolean) => void;
  setErrorPincode: (error: string | null) => void;

  // Helpers
  clearLocationState: () => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocationContext = () => {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};
