import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import log from '../utils/logger';

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
    } catch (error) {
      log.error('Error saving auth:', error);
    }
  };

  const logout = async () => {
    try {
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

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
