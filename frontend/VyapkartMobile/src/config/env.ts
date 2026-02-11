// /src/config/env.ts
const DEV = {
  API_BASE_URL: 'http://10.59.237.58:8080',
};

const PROD = {
  API_BASE_URL: 'https://api.vyapkart.store',
};

export const ENV = __DEV__ ? DEV : PROD;
