// src/services/firebaseAuth.service.ts
import auth from '@react-native-firebase/auth';
import { apiClient } from '../api/client';

export interface AuthResult {
  uid: string;
  email: string | null;
  token: string;
}

/**
 * Register
 */
export const registerWithEmail = async (
  email: string,
  password: string,
): Promise<void> => {
  try {
    const credential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );

    await credential.user.sendEmailVerification();
  } catch (error: any) {
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * Login
 */
export const loginWithEmail = async (email: string, password: string) => {
  const result = await auth().signInWithEmailAndPassword(email, password);

  const firebaseToken = await result.user.getIdToken();

  const backendResponse = await apiClient.post(
    '/auth/firebase-login',
    {},
    {
      headers: {
        Authorization: `Bearer ${firebaseToken}`,
      },
    },
  );
  console.log('✅ Backend response:', backendResponse.data);

  return backendResponse.data;
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  await auth().signOut();
};
