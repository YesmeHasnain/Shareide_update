import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'https://api.shareide.com/api';

// Track auth state to prevent cascading 401s
let isLoggingOut = false;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
    if (error.response?.status === 401 && !isLoggingOut) {
      const url = error.config?.url || '';
      // Skip token clearing for background/cleanup requests
      const skipLogoutPaths = ['/push-notifications/', '/notifications/', '/driver/status', '/driver/location', '/logout'];
      const shouldSkip = skipLogoutPaths.some(path => url.includes(path));
      if (!shouldSkip) {
        isLoggingOut = true;
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        // Reset flag after a short delay to allow re-login
        setTimeout(() => { isLoggingOut = false; }, 2000);
      }
    }
    return Promise.reject(error);
  }
);

// Export helper to check if token exists before making optional API calls
export const hasAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  } catch {
    return false;
  }
};

export const setLoggingOut = (value) => { isLoggingOut = value; };

export default client;