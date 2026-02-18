// src/services/firebaseAuth.service.ts
/**
 * ====================================================================
 *  COMPLETE LOGIN & REGISTRATION FLOW
 * ====================================================================
 *
 * This follows the documented architecture:
 *
 * REGISTRATION FLOW:
 * 1. registerWithEmail() → Creates Firebase account + sends verification email
 * 2. User verifies email
 * 3. User logs back in → loginWithEmail() gets Firebase ID Token
 * 4. loginWithEmail() sends token + registration data to backend
 * 5. Backend verifies token, creates user in DB, returns JWT
 * 6. Frontend stores JWT
 *
 * LOGIN FLOW:
 * 1. loginWithEmail() → Firebase authentication
 * 2. Gets Firebase ID Token
 * 3. Exchanges token for backend JWT via /auth/firebase-login
 * 4. Backend verifies token, returns JWT
 * 5. Frontend stores JWT
 *
 * KEY INSIGHT:
 * - Firebase = Identity Provider (confirms email ownership)
 * - Backend JWT = Your system authorization (roles, permissions)
 * - Never trust frontend claims about identity
 * - Always verify Firebase token on backend
 */

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  getIdToken,
} from '@react-native-firebase/auth';
import { apiClient } from '../api/client';

export interface AuthResult {
  userId: number;
  email: string;
  fullName: string | null;
  phone: string | null;
  roles: string[];
  token: string;
}

/**
 * STEP 1: REGISTER WITH EMAIL
 * =============================
 * 
 * What happens:
 * - Creates Firebase authentication account
 * - Generates Firebase UID
 * - Sends email verification (user MUST verify to login)
 * - Does NOT contact backend yet
 * 
 * Why?
 * - Backend user should only be created after email verification
 * - Email verification proves user owns the email
 * - Prevents spam/fake account creation
 * 
 * Next step:
 * - User clicks email verification link
 * - User logs in with email/password
 * - Backend creates DB user on first successful login
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: 'BUYER' | 'SELLER',
  businessName?: string,
  _gstNumber?: string
): Promise<void> => {
  try {
    console.log('🔐 REGISTER: Creating Firebase account...');
    console.log(`📋 Registration info: ${fullName} (${role})${businessName ? ` - ${businessName}` : ''}`);
    const auth = getAuth();

    // Create Firebase account
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    console.log('✅ REGISTER: Firebase account created, UID:', credential.user.uid);

    // Send email verification
    console.log('📧 REGISTER: Sending verification email...');
    await credential.user.sendEmailVerification();

    console.log('✅ REGISTER: Verification email sent to', email);

    // Note: Registration data is now stored in AsyncStorage by RegisterScreen
    // and will be used during first-time login after email verification
  } catch (error: any) {
    console.error('❌ REGISTER: Failed -', error.code, error.message);
    throw new Error(error.message || 'Registration failed');
  }
};

/**
 * STEP 2: LOGIN WITH EMAIL
 * ==========================
 * 
 * Two scenarios:
 * 
 * A. FIRST-TIME LOGIN (after registration):
 *    - Includes registration data (fullName, phone, role, businessName, gst)
 *    - Backend creates user in DB
 *    - Backend returns JWT
 * 
 * B. REGULAR LOGIN (existing user):
 *    - Just email/password
 *    - Backend finds existing user
 *    - Backend returns JWT
 * 
 * Process:
 * 1. Authenticate with Firebase
 * 2. Check email is verified
 * 3. Get Firebase ID Token (JWT from Firebase)
 * 4. Send to backend with optional registration data
 * 5. Backend:
 *    - Verifies Firebase token
 *    - Checks/creates user in DB
 *    - Generates backend JWT
 * 6. Return backend JWT to frontend
 */
export const loginWithEmail = async (
  email: string,
  password: string,
  role?: 'BUYER' | 'SELLER',
  businessName?: string,
  gstNumber?: string,
  fullName?: string,
  phone?: string
): Promise<AuthResult> => {
  try {
    console.log('🔐 LOGIN: Authenticating with Firebase...');
    const auth = getAuth();

    // STEP 1: Sign in with Firebase
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ LOGIN: Firebase authentication successful');

    // STEP 2: Check if email is verified
    const user = result.user;
    if (!user.emailVerified) {
      console.log('⚠️ LOGIN: Email not verified');
      await signOut(auth);
      throw new Error(
        'Please verify your email before logging in. Check your inbox for the verification email.'
      );
    }
    console.log('✅ LOGIN: Email verified');

    // STEP 3: Get Firebase ID Token
    console.log('🎫 LOGIN: Getting Firebase ID Token...');
    const firebaseToken = await getIdToken(user);
    console.log('✅ LOGIN: Firebase ID Token obtained');

    // STEP 4: Prepare request for backend
    // ====================================
    // For REGISTRATION scenario (first-time login):
    //   Send: fullName, phone, role, businessName, gstNumber
    // For LOGIN scenario (existing user):
    //   Send: empty body
    const requestBody: {
      fullName?: string;
      phone?: string;
      role?: string;
      businessName?: string;
      gstNumber?: string;
    } = {};

    // Only include fields if provided (indicates first-time registration login)
    if (fullName) requestBody.fullName = fullName;
    if (phone) requestBody.phone = phone;
    if (role) {
      // Always include role for first-time login (both BUYER and SELLER)
      requestBody.role = role;
    }
    if (businessName) requestBody.businessName = businessName;
    if (gstNumber) requestBody.gstNumber = gstNumber;

    const hasRegistrationData = Object.keys(requestBody).length > 0;
    const loginType = hasRegistrationData ? 'FIRST-TIME (with registration data)' : 'REGULAR';
    console.log(`🌉 LOGIN: Exchanging Firebase token for backend JWT (${loginType})...`);

    // STEP 5: Exchange Firebase token for backend JWT
    const backendResponse = await apiClient.post(
      '/auth/firebase-login',
      Object.keys(requestBody).length > 0 ? requestBody : {},
      {
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
        },
      }
    );

    console.log('✅ LOGIN: Backend JWT obtained');
    console.log('👤 User:', backendResponse.data);

    return backendResponse.data;
  } catch (error: any) {
    console.error('❌ LOGIN: Failed -', error.message);
    throw new Error(error.message || 'Login failed');
  }
};

/**
 * LOGOUT
 * ======
 * Signs out from Firebase
 */
export const logout = async (): Promise<void> => {
  try {
    console.log('🚪 LOGOUT: Signing out...');
    const auth = getAuth();
    await signOut(auth);
    console.log('✅ LOGOUT: Signed out');
  } catch (error: any) {
    console.error('❌ LOGOUT: Failed -', error.message);
    throw error;
  }
};
