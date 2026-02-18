// /src/api/auth.api.ts
import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export interface FirebaseLoginPayload {
  fullName?: string;
  phone?: string;
  role?: string;
  businessName?: string;
  gstNumber?: string;
}

/**
 * Firebase login - exchange Firebase token for JWT
 * Token passed in Authorization header as "Bearer <token>"
 */
export const firebaseLogin = (payload: FirebaseLoginPayload) => {
  return apiClient.post(ENDPOINTS.AUTH.FIREBASE_LOGIN, payload);
};

/**
 * Standard email/password login
 */
export const login = (payload: { email: string; password: string }) => {
  return apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
};

/**
 * Register new user
 */
export const register = (payload: {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
  businessName?: string;
  gstNumber?: string;
}) => {
  return apiClient.post(ENDPOINTS.AUTH.REGISTER, payload);
};

/**
 * Verify OTP
 */
export const verifyOtp = (payload: { phone: string; otp: string }) => {
  return apiClient.post(ENDPOINTS.AUTH.OTP, payload);
};