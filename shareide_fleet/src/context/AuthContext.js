import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from '../utils/notificationService';
import { setLoggingOut } from '../api/client';

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

        // Small delay to ensure token is available for API calls
        setTimeout(() => {
          notificationService.registerToken().catch((err) => {
            console.log('Failed to re-register push token on restart:', err.message);
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Load user data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, userToken) => {
    try {
      // Save token FIRST so it's available for subsequent API calls
      await AsyncStorage.setItem('userToken', userToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);

      // Register device for push notifications after token is saved
      setTimeout(() => {
        notificationService.registerToken().catch((err) => {
          console.log('Failed to register push token:', err.message);
        });
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    // Signal that we're logging out to prevent 401 cascade
    setLoggingOut(true);

    // Unregister push token BEFORE clearing auth (needs the token to make API call)
    try {
      await notificationService.unregisterToken();
    } catch (error) {
      // Ignore - best effort
    }

    // Now try backend logout
    try {
      const { authAPI } = require('../api/auth');
      await authAPI.logout().catch(() => {});
    } catch (error) {
      // Ignore
    }

    // Clear local state LAST
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);

    // Reset logging out flag after cleanup
    setTimeout(() => { setLoggingOut(false); }, 1000);
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