// /src/api/ENDPOINTS.ts
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FIREBASE_LOGIN: '/auth/firebase-login',
    OTP: '/auth/otp',
  },

  USER: {
    PROFILE: '/users/me',
  },

  CATALOG: {
    PRODUCTS: '/catalog/products',
  },

  ORDER: {
    CREATE: '/orders',
    MY_ORDERS: '/orders/my',
  },
};
