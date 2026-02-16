import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

// Safe import - avoids crash in Expo Go for SDK 53+
let Notifications = null;
try {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (e) {
  // expo-notifications not available (Expo Go limitation)
}

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  async initialize() {
    if (!Notifications) return null;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') return null;

      if (Device.isDevice) {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
        if (!projectId) return null;
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        this.expoPushToken = tokenData.data;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FCC014',
        });
        await Notifications.setNotificationChannelAsync('rides', {
          name: 'Ride Updates',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#FCC014',
          sound: 'default',
        });
        await Notifications.setNotificationChannelAsync('promotions', {
          name: 'Promotions',
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: '#FCC014',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      // Silently fail in Expo Go
      return null;
    }
  }

  async registerToken() {
    try {
      if (!this.expoPushToken) await this.initialize();
      if (!this.expoPushToken) return false;

      await apiClient.post('/notifications/register-token', {
        token: this.expoPushToken,
        platform: Platform.OS,
        device_name: Device.modelName || 'Unknown Device',
      });

      await AsyncStorage.setItem('pushToken', this.expoPushToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  async unregisterToken() {
    try {
      const savedToken = await AsyncStorage.getItem('pushToken');
      if (savedToken) {
        await apiClient.post('/push-notifications/unregister-device', {
          token: savedToken,
        });
        await AsyncStorage.removeItem('pushToken');
      }
    } catch (error) {}
  }

  addListeners(onNotification, onNotificationResponse) {
    if (!Notifications) return;
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => { if (onNotification) onNotification(notification); }
    );
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => { if (onNotificationResponse) onNotificationResponse(response); }
    );
  }

  removeListeners() {
    if (!Notifications) return;
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  getToken() {
    return this.expoPushToken;
  }
}

export default new NotificationService();
