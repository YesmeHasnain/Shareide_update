import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors, lightColors } from '../theme/colors';

const ThemeContext = createContext(null);

// Default colors for fallback
const defaultColors = lightColors;

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const colors = getThemeColors(isDark);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Load theme error:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Toggle theme error:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  // Return default colors if context is not available (during initial load)
  if (!context) {
    return { isDark: false, colors: defaultColors, toggleTheme: () => {} };
  }
  return context;
};