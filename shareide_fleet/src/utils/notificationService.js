import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create Android notification channels immediately at module load
// (before any notification arrives, even before login)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FCC014',
  }).catch(() => {});

  Notifications.setNotificationChannelAsync('rides', {
    name: 'Ride Requests',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 500, 250, 500],
    lightColor: '#FCC014',
    sound: 'default',
  }).catch(() => {});

  Notifications.setNotificationChannelAsync('chat', {
    name: 'Chat Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FCC014',
    sound: 'default',
  }).catch(() => {});
}

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notifications
  async initialize() {
    try {
      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      // Get Expo push token
      if (Device.isDevice) {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        if (!projectId) {
          console.log('No projectId found, skipping push token registration');
          return null;
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        this.expoPushToken = tokenData.data;
        console.log('Expo Push Token:', this.expoPushToken);
      } else {
        console.log('Must use physical device for push notifications');
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('Notification initialization error:', error);
      return null;
    }
  }

  // Register device token with backend
  async registerToken() {
    try {
      // Check if user is authenticated before making API call
      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        console.log('No auth token, skipping push token registration');
        return false;
      }

      if (!this.expoPushToken) {
        await this.initialize();
      }

      if (!this.expoPushToken) {
        console.log('No push token available');
        return false;
      }

      const response = await client.post('/notifications/register-token', {
        token: this.expoPushToken,
        platform: Platform.OS,
        device_name: Device.modelName || 'Unknown Device',
      });

      console.log('Token registered:', response.data);
      await AsyncStorage.setItem('pushToken', this.expoPushToken);
      return true;
    } catch (error) {
      console.log('Token registration failed:', error.message);
      return false;
    }
  }

  // Unregister device token (on logout)
  async unregisterToken() {
    try {
      const authToken = await AsyncStorage.getItem('userToken');
      const savedToken = await AsyncStorage.getItem('pushToken');

      if (savedToken && authToken) {
        await client.post('/push-notifications/unregister-device', {
          token: savedToken,
        });
      }
      // Always clean up local storage
      await AsyncStorage.removeItem('pushToken');
    } catch (error) {
      console.log('Token unregistration failed:', error.message);
      // Still clean up local storage
      await AsyncStorage.removeItem('pushToken').catch(() => {});
    }
  }

  // Add notification listeners
  addListeners(onNotification, onNotificationResponse) {
    // Listener for received notifications (foreground)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        if (onNotification) {
          onNotification(notification);
        }
      }
    );

    // Listener for user interaction with notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        if (onNotificationResponse) {
          onNotificationResponse(response);
        }
      }
    );
  }

  // Remove listeners
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get push token
  getToken() {
    return this.expoPushToken;
  }

  // Schedule local notification (for testing)
  async scheduleLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds: 1 },
    });
  }
}

export default new NotificationService();
