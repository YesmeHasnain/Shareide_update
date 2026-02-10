import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// PRODUCTION MODE - Real API calls enabled
const USE_MOCK_DATA = false;

// API Configuration - Change this to your server IP
// For development: Use ngrok URL for mobile testing
// For production: Use your actual server URL
const DEV_API_URL = 'https://calm-coins-lie.loca.lt/api';
const PROD_API_URL = 'https://api.shareide.com/api';

// Dev mode - using local network IP for testing
const API_BASE_URL = DEV_API_URL;

// Mock data for testing UI
const MOCK_RESPONSES = {
  '/rides/history': {
    success: true,
    data: {
      rides: [
        {
          id: 1,
          driver: { user: { name: 'Ahmed Khan' } },
          created_at: '2024-01-15T10:30:00Z',
          estimated_price: 450,
          status: 'completed',
          pickup_address: 'Gulshan-e-Iqbal Block 13',
          drop_address: 'Clifton Beach',
        },
        {
          id: 2,
          driver: { user: { name: 'Ali Hassan' } },
          created_at: '2024-01-14T15:00:00Z',
          estimated_price: 320,
          status: 'completed',
          pickup_address: 'Saddar',
          drop_address: 'Defence Phase 5',
        },
      ],
    },
  },
  '/rides/active': {
    success: true,
    data: null,
  },
  '/scheduled-rides/upcoming-count': {
    success: true,
    data: { count: 2 },
  },
  '/scheduled-rides': {
    success: true,
    data: {
      upcoming: [
        { id: 1, pickup_address: 'Gulshan', drop_address: 'Clifton', scheduled_time: '2024-01-20T09:00:00Z', status: 'pending' },
        { id: 2, pickup_address: 'DHA', drop_address: 'Airport', scheduled_time: '2024-01-21T14:00:00Z', status: 'pending' },
      ],
      past: [],
    },
  },
  '/rider-wallet/balance': {
    success: true,
    data: { balance: 5000, currency: 'PKR' },
  },
  '/rider-wallet/transactions': {
    success: true,
    data: {
      transactions: [
        { id: 1, type: 'topup', amount: 1000, created_at: '2024-01-15', description: 'Wallet Top Up' },
        { id: 2, type: 'ride', amount: -450, created_at: '2024-01-14', description: 'Ride Payment' },
        { id: 3, type: 'topup', amount: 2000, created_at: '2024-01-10', description: 'JazzCash Top Up' },
      ],
    },
  },
  '/rider-wallet/payment-methods': {
    success: true,
    data: [
      { id: 1, type: 'cash', name: 'Cash', is_default: true },
      { id: 2, type: 'jazzcash', name: 'JazzCash', account: '03001234567', is_default: false },
    ],
  },
  '/loyalty/dashboard': {
    success: true,
    data: {
      total_points: 250,
      available_points: 200,
      tier: { name: 'Silver', badge_color: '#C0C0C0', discount_percentage: 5 },
      next_tier: { name: 'Gold', min_points: 500 },
    },
  },
  '/loyalty/rewards': {
    success: true,
    data: [
      { id: 1, name: 'Free Ride', points_required: 500, reward_type: 'free_ride', description: 'Get a free ride up to Rs 500' },
      { id: 2, name: '20% Off', points_required: 200, reward_type: 'discount_percentage', description: '20% discount on next ride' },
    ],
  },
  '/loyalty/achievements': {
    success: true,
    data: [
      { id: 1, name: 'First Ride', description: 'Complete your first ride', is_completed: true, points_reward: 50 },
      { id: 2, name: 'Frequent Rider', description: 'Complete 10 rides', is_completed: false, current_progress: 5, target_value: 10, points_reward: 100 },
    ],
  },
  '/shared-rides': {
    success: true,
    data: [
      { id: 1, pickup_address: 'Gulshan', drop_address: 'DHA', departure_time: '2024-01-20T09:00:00Z', price_per_seat: 150, available_seats: 2, driver: { name: 'Kamran Ali', rating: 4.8 } },
    ],
  },
  '/user/profile': {
    success: true,
    data: {
      id: 1,
      name: 'Test User',
      phone: '+923001234567',
      email: 'test@shareide.com',
      avatar: null,
    },
  },
};

// Create mock API client for testing
const createMockClient = () => {
  return {
    get: async (url, config) => {
      console.log('🔵 MOCK GET:', url);
      const mockKey = Object.keys(MOCK_RESPONSES).find(key => url.includes(key));
      if (mockKey) {
        return { data: MOCK_RESPONSES[mockKey] };
      }
      return { data: { success: true, data: [] } };
    },
    post: async (url, data, config) => {
      console.log('🔵 MOCK POST:', url, data);
      return { data: { success: true, message: 'Mock success' } };
    },
    put: async (url, data, config) => {
      console.log('🔵 MOCK PUT:', url, data);
      return { data: { success: true, message: 'Mock success' } };
    },
    delete: async (url, config) => {
      console.log('🔵 MOCK DELETE:', url);
      return { data: { success: true, message: 'Mock success' } };
    },
  };
};

const realApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Log API URL in development
if (__DEV__) {
  console.log('📡 API URL:', API_BASE_URL);
  console.log('🧪 Mock Mode:', USE_MOCK_DATA ? 'ENABLED' : 'DISABLED');
}

// Request interceptor to add auth token
realApiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
realApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// Export mock or real client based on mode
const apiClient = USE_MOCK_DATA ? createMockClient() : realApiClient;

export default apiClient;
export { API_BASE_URL };
