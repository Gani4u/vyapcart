import { apiClient } from './client';
import { ENDPOINTS } from './endpoints';

export const login = (payload: { phone: string }) => {
  return apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
};

export const verifyOtp = (payload: { phone: string; otp: string }) => {
  return apiClient.post(ENDPOINTS.AUTH.OTP, payload);
};
