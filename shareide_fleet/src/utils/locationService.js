import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { hasAuthToken } from '../api/client';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds

class LocationService {
  constructor() {
    this.watchId = null;
    this.isTracking = false;
    this.lastLocation = null;
    this.onLocationUpdate = null;
  }

  // Request location permissions
  async requestPermissions() {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      // Background permission is optional - don't fail if it's denied
      try {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission denied - tracking only works when app is open');
        }
      } catch (bgError) {
        console.log('Background permission not available:', bgError.message);
      }

      return true;
    } catch (error) {
      console.log('Permission request error:', error.message);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      this.lastLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      };

      return this.lastLocation;
    } catch (error) {
      console.error('Get current location error:', error);
      return null;
    }
  }

  // Start real-time location tracking
  async startTracking(callback) {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Location permission not granted');
        return false;
      }

      this.isTracking = true;
      this.onLocationUpdate = callback;

      // Start foreground location watching
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 10, // Update if moved 10 meters
        },
        (location) => {
          this.lastLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
            timestamp: location.timestamp,
          };

          // Call the callback with new location
          if (this.onLocationUpdate) {
            this.onLocationUpdate(this.lastLocation);
          }

          // Send to backend
          this.sendLocationToServer(this.lastLocation);
        }
      );

      // Also start background tracking for when app is minimized
      this.startBackgroundTracking();

      console.log('Location tracking started');
      return true;
    } catch (error) {
      console.error('Start tracking error:', error);
      return false;
    }
  }

  // Start background location tracking (works when app is minimized)
  async startBackgroundTracking() {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Background location permission not granted');
        return false;
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        console.log('Background location task already registered');
        return true;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 15000, // 15 seconds
        distanceInterval: 20, // 20 meters minimum movement
        deferredUpdatesInterval: 15000,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Shareide Fleet',
          notificationBody: 'Tracking your location for active rides',
          notificationColor: '#FCC014',
        },
      });

      console.log('Background location tracking started');
      return true;
    } catch (error) {
      console.log('Background tracking start error:', error.message);
      return false;
    }
  }

  // Stop background location tracking
  async stopBackgroundTracking() {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        console.log('Background location tracking stopped');
      }
    } catch (error) {
      console.log('Background tracking stop error:', error.message);
    }
  }

  // Stop location tracking (foreground + background)
  async stopTracking() {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      this.isTracking = false;
      this.onLocationUpdate = null;

      // Stop background tracking too
      await this.stopBackgroundTracking();

      // Only update backend if user is still authenticated
      const hasToken = await hasAuthToken();
      if (hasToken) {
        await this.updateDriverStatus(false);
      }

      console.log('Location tracking stopped');
    } catch (error) {
      console.log('Stop tracking error:', error.message);
    }
  }

  // Send location to server
  async sendLocationToServer(location) {
    try {
      const hasToken = await hasAuthToken();
      if (!hasToken) return;

      await client.post('/driver/location', {
        latitude: location.latitude,
        longitude: location.longitude,
        heading: location.heading,
        speed: location.speed,
      });
    } catch (error) {
      // Silently fail - location updates are not critical
      console.log('Location update failed:', error.message);
    }
  }

  // Update driver online/offline status
  async updateDriverStatus(isOnline, latitude = null, longitude = null) {
    try {
      const hasToken = await hasAuthToken();
      if (!hasToken) {
        console.log('No auth token, skipping driver status update');
        return { success: false };
      }

      const lat = latitude || this.lastLocation?.latitude;
      const lng = longitude || this.lastLocation?.longitude;

      const response = await client.post('/driver/status', {
        is_online: isOnline,
        latitude: lat,
        longitude: lng,
      });
      return response.data;
    } catch (error) {
      console.log('Update driver status error:', error.message);
      throw error;
    }
  }

  // Get last known location
  getLastLocation() {
    return this.lastLocation;
  }

  // Check if currently tracking
  isCurrentlyTracking() {
    return this.isTracking;
  }
}

// Define background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          await client.post('/driver/location', {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
          });
        }
      } catch (e) {
        console.log('Background location update failed');
      }
    }
  }
});

export default new LocationService();
