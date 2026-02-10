import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../utils/notificationService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Load user data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, userToken) => {
    try {
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);

      // Register device for push notifications
      setTimeout(async () => {
        try {
          await notificationService.registerToken();
        } catch (err) {
          console.log('Failed to register push token:', err);
        }
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Clear local state FIRST so user is logged out immediately
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);

    // Then try API cleanup in background (don't block logout)
    try {
      notificationService.unregisterToken().catch(() => {});
      const { authAPI } = require('../api/auth');
      authAPI.logout().catch(() => {});
    } catch (error) {
      // Ignore - user is already logged out locally
    }
  };

  const updateUser = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Return default values if context is not available
  if (!context) {
    return {
      user: null,
      token: null,
      loading: true,
      isAuthenticated: false,
      login: () => {},
      logout: () => {},
      updateUser: () => {},
    };
  }
  return context;
};