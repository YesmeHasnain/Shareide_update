import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs(['Non-serializable values']);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style='auto' />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
