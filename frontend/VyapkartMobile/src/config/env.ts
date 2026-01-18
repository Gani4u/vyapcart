const DEV = {
  API_BASE_URL: 'http://192.168.0.110:8080',
};

const PROD = {
  API_BASE_URL: 'https://api.vyapkart.store',
};

export const ENV = __DEV__ ? DEV : PROD;
