// /src/services/token.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'AUTH_TOKEN';
const USER_DATA_KEY = 'USER_DATA';
const REGISTRATION_DATA_KEY = 'REGISTRATION_DATA';

export interface UserData {
  userId: number;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  roles: string[];
}

export interface RegistrationData {
  email: string;
  fullName: string;
  phone: string;
  role: 'BUYER' | 'SELLER';
  businessName?: string;
  gstNumber?: string;
  timestamp: number; // For cleanup of stale data
}

/**
 * Save JWT token
 */
export const saveToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get JWT token
 */
export const getToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

/**
 * Save user data (roles, profile info, etc.)
 */
export const saveUserData = async (userData: UserData) => {
  await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
};

/**
 * Get user data
 */
export const getUserData = async (): Promise<UserData | null> => {
  const data = await AsyncStorage.getItem(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * ===== REGISTRATION DATA HELPERS =====
 * Store registration data temporarily after Firebase registration.
 * This avoids users re-entering the same data after email verification.
 */

/**
 * Save registration data for the user who just registered.
 * This will be used during first-time login after email verification.
 */
export const saveRegistrationData = async (data: RegistrationData) => {
  await AsyncStorage.setItem(REGISTRATION_DATA_KEY, JSON.stringify(data));
};

/**
 * Get registration data if it exists.
 * Returns null if no registration data or data is stale (>24 hours old).
 */
export const getRegistrationData = async (): Promise<RegistrationData | null> => {
  const data = await AsyncStorage.getItem(REGISTRATION_DATA_KEY);
  if (!data) return null;

  const parsed: RegistrationData = JSON.parse(data);
  const ageInMs = Date.now() - parsed.timestamp;
  const ageInHours = ageInMs / (1000 * 60 * 60);

  // Discard if older than 24 hours
  if (ageInHours > 24) {
    await clearRegistrationData();
    return null;
  }

  return parsed;
};

/**
 * Clear registration data (after successful backend login)
 */
export const clearRegistrationData = async () => {
  await AsyncStorage.removeItem(REGISTRATION_DATA_KEY);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_DATA_KEY);
  await AsyncStorage.removeItem(REGISTRATION_DATA_KEY);
};
