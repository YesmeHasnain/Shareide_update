import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration - Change this to your server IP
const DEV_API_URL = 'https://blue-steaks-smile.loca.lt/api';
const PROD_API_URL = 'https://api.shareide.com/api';
// Dev mode - using local API via tunnel for testing
const API_BASE_URL = DEV_API_URL;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'bypass-tunnel-reminder': 'true',
  },
  timeout: 30000,
});

// Add token to requests
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token retrieval error:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Only clear token for main auth endpoints, not background requests like push notifications
      const url = error.config?.url || '';
      const skipLogoutPaths = ['/push-notifications/', '/notifications/'];
      const shouldSkip = skipLogoutPaths.some(path => url.includes(path));
      if (!shouldSkip) {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
      }
    }
    return Promise.reject(error);
  }
);

export default client;