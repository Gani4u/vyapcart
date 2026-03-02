// src/types/location.ts

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SellerLocationRequest {
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
}

export interface SellerLocationResponse {
  sellerId: number;
  businessName: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PincodeResponse {
  pincode: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
}

export interface NearbyProductResponse {
  productId: number;
  name: string;
  businessName: string;
  price: number;
  distance: number;
}

export interface LocationError {
  code: string;
  message: string;
  statusCode?: number;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}
