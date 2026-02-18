import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { I18nProvider } from './src/i18n';
import AppNavigator from './src/navigation/AppNavigator';
import notificationService from './src/utils/notificationService';

LogBox.ignoreLogs([
  'Non-serializable values',
  'Reanimated',
  'Worklets',
  'expo-notifications',
  'Android Push notifications',
]);

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
        // Foreground notification received
        (notification) => {
          const { title, body, data } = notification.request.content;

          // Show in-app alert for ride updates
          if (data?.type === 'new_bid' || data?.type === 'bid_accepted' || data?.type === 'ride_accepted') {
            Alert.alert(title, body);
          }
          if (data?.type === 'ride_started' || data?.type === 'ride_completed' || data?.type === 'ride_cancelled') {
            Alert.alert(title, body);
          }
        },
        // Notification tapped - navigate to relevant screen
        (response) => {
          const { data } = response.notification.request.content;
          const nav = navigationRef.current;
          if (!nav) return;

          switch (data?.type) {
            case 'new_bid':
            case 'bid_accepted':
            case 'counter_accepted':
              if (data.ride_request_id) {
                nav.navigate('Negotiation', { rideRequestId: data.ride_request_id });
              }
              break;
            case 'ride_accepted':
            case 'ride_started':
              if (data.ride_id) {
                nav.navigate('RideTracking', { ride: { id: data.ride_id } });
              }
              break;
            case 'ride_completed':
              if (data.ride_id) {
                nav.navigate('RideReceipt', { ride: { id: data.ride_id } });
              }
              break;
            default:
              nav.navigate('Notifications');
              break;
          }
        }
      );
    } catch (error) {
      // Silent fail - notifications are optional
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <ThemeProvider>
            <AuthProvider>
              <StatusBar style='auto' />
              <AppNavigator ref={navigationRef} />
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
