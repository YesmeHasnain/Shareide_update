import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/utils/notificationService';

LogBox.ignoreLogs(['Non-serializable values', 'Reanimated', 'Worklets']);

function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    initializeNotifications();
    return () => {
      notificationService.removeListeners();
    };
  }, []);

  const initializeNotifications = async () => {
    try {
      await notificationService.initialize();

      notificationService.addListeners(
        // Foreground notification
        (notification) => {
          const { title, body, data } = notification.request.content;

          // Show alert for important notifications
          if (data?.type === 'driver_approved' || data?.type === 'driver_rejected') {
            Alert.alert(title, body);
          }
          if (data?.type === 'new_ride' || data?.type === 'bid_countered' || data?.type === 'counter_accepted') {
            Alert.alert(title, body);
          }
          if (data?.type === 'ride_cancelled') {
            Alert.alert(title, body);
          }
        },
        // Notification tapped - navigate
        (response) => {
          const { data } = response.notification.request.content;
          const nav = navigationRef.current;
          if (!nav) return;

          switch (data?.type) {
            case 'new_ride':
              if (data.ride_id) {
                nav.navigate('RideRequest', { rideId: data.ride_id });
              }
              break;
            case 'bid_countered':
            case 'counter_accepted':
              if (data.ride_request_id) {
                nav.navigate('RideRequest', { rideId: data.ride_request_id });
              }
              break;
            case 'ride_cancelled':
              nav.navigate('Dashboard');
              break;
            case 'driver_approved':
              // App state will auto-redirect
              break;
            default:
              nav.navigate('Notifications');
              break;
          }
        }
      );
    } catch (error) {
      // Silent fail
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <AppNavigator ref={navigationRef} />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;