import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/utils/notificationService';

LogBox.ignoreLogs(['Non-serializable values', 'Reanimated', 'Worklets']);

export default function App() {
  useEffect(() => {
    // Initialize push notifications
    initializeNotifications();

    return () => {
      // Cleanup listeners on unmount
      notificationService.removeListeners();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();

      // Add notification listeners
      notificationService.addListeners(
        // Handle foreground notification
        (notification) => {
          const { title, body, data } = notification.request.content;
          console.log('Foreground notification:', title, body);

          // Show in-app alert for important notifications
          if (data?.type === 'driver_approved' || data?.type === 'driver_rejected') {
            Alert.alert(title, body);
          }
        },
        // Handle notification tap
        (response) => {
          const { data } = response.notification.request.content;
          console.log('Notification tapped:', data);

          // Handle navigation based on notification type
          if (data?.type === 'driver_approved') {
            // User will be redirected automatically when app state updates
            console.log('Driver approved - refresh app state');
          }
        }
      );
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}