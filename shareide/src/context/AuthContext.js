import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import log from '../utils/logger';
import notificationService from '../utils/notificationService';
import apiClient from '../api/client';

const AuthContext = createContext();

// TODO: TESTING MODE - Set to false to restore normal auth flow
const BYPASS_AUTH = false;
const MOCK_USER = {
  id: 1,
  name: 'Muzammil Khan',
  phone: '+923001234567',
  email: 'muzammil@shareide.com',
  gender: 'male',
  avatar: null,
  wallet_balance: 5000,
  total_loyalty_points: 250,
  available_loyalty_points: 200,
  loyalty_tier: { name: 'Silver', badge_color: '#C0C0C0' },
  created_at: '2024-01-01T00:00:00.000Z',
};
const MOCK_TOKEN = 'test-token-bypass-auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (BYPASS_AUTH) {
      // Set mock data after a small delay to ensure context is ready
      setTimeout(() => {
        setUser(MOCK_USER);
        setToken(MOCK_TOKEN);
        setLoading(false);
      }, 100);
    } else {
      loadStoredAuth();
    }
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Re-register push token on app restart
        notificationService.registerToken().catch(() => {});
        // Refresh user data from server in background
        apiClient.get('/me').then(response => {
          if (response.data?.success && response.data?.user) {
            const freshUser = response.data.user;
            AsyncStorage.setItem('user', JSON.stringify(freshUser));
            setUser(freshUser);
          }
        }).catch(() => {});
      }
    } catch (error) {
      log.error('Error loading auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setToken(authToken);
      setUser(userData);

      // Register push notification token after login
      notificationService.registerToken().catch(() => {});
    } catch (error) {
      log.error('Error saving auth:', error);
    }
  };

  const logout = async () => {
    try {
      // Unregister push token before clearing auth
      await notificationService.unregisterToken().catch(() => {});

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      log.error('Error during logout:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      log.error('Error updating user:', error);
    }
  };

  const refreshUser = useCallback(async () => {
    try {
      const currentToken = await AsyncStorage.getItem('token');
      if (!currentToken) return;
      const response = await apiClient.get('/me');
      if (response.data?.success && response.data?.user) {
        const freshUser = response.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
      }
    } catch (error) {
      log.error('Error refreshing user:', error);
    }
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
