import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import notificationService from './notificationService';
import client from '../api/client';

const POLL_INTERVAL = 5000; // 5 seconds

class RideRequestService {
  constructor() {
    this.isPolling = false;
    this.pollInterval = null;
    this.onNewRideRequest = null;
    this.onRideUpdate = null;
    this.activeRideId = null;
    this.appState = AppState.currentState;
  }

  // Start polling for ride requests
  start(callbacks = {}) {
    if (this.isPolling) return;

    this.onNewRideRequest = callbacks.onNewRideRequest;
    this.onRideUpdate = callbacks.onRideUpdate;
    this.isPolling = true;

    // Start polling
    this.pollInterval = setInterval(() => {
      this.checkForRideRequests();
    }, POLL_INTERVAL);

    // Listen for app state changes
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      if (this.appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - check immediately
        this.checkForRideRequests();
      }
      this.appState = nextAppState;
    });

    // Check immediately
    this.checkForRideRequests();

    console.log('Ride request service started');
  }

  // Stop polling
  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.isPolling = false;
    this.onNewRideRequest = null;
    this.onRideUpdate = null;

    console.log('Ride request service stopped');
  }

  // Check for new ride requests
  async checkForRideRequests() {
    try {
      const response = await client.get('/driver/pending-requests');

      if (response.data.success) {
        const requests = response.data.data || [];

        // Notify about new ride requests
        if (requests.length > 0 && this.onNewRideRequest) {
          // Haptic feedback for new request
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          this.onNewRideRequest(requests);
        }
      }
    } catch (error) {
      // Silently fail
      console.log('Check ride requests error:', error.message);
    }
  }

  // Check active ride status
  async checkActiveRide() {
    try {
      const response = await client.get('/driver/active-ride');

      if (response.data.success && response.data.ride) {
        const ride = response.data.ride;
        this.activeRideId = ride.id;

        if (this.onRideUpdate) {
          this.onRideUpdate(ride);
        }

        return ride;
      }

      return null;
    } catch (error) {
      console.log('Check active ride error:', error.message);
      return null;
    }
  }

  // Accept a ride request
  async acceptRide(rideId) {
    try {
      const response = await client.post(`/rides/${rideId}/accept`);

      if (response.data.success) {
        this.activeRideId = rideId;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to accept ride');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Reject a ride request
  async rejectRide(rideId, reason = '') {
    try {
      const response = await client.post(`/rides/${rideId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Start a ride (driver arrived, passenger picked up)
  async startRide(rideId) {
    try {
      const response = await client.post(`/rides/${rideId}/start`);

      if (response.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to start ride');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Complete a ride
  async completeRide(rideId) {
    try {
      const response = await client.post(`/rides/${rideId}/complete`);

      if (response.data.success) {
        this.activeRideId = null;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to complete ride');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    }
  }

  // Cancel a ride
  async cancelRide(rideId, reason = '') {
    try {
      const response = await client.post(`/rides/${rideId}/cancel`, { reason });

      if (response.data.success) {
        this.activeRideId = null;
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to cancel ride');
    } catch (error) {
      throw error;
    }
  }

  // Update driver arrived status
  async driverArrived(rideId) {
    try {
      const response = await client.post(`/rides/${rideId}/arrived`);

      if (response.data.success) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        return response.data;
      }

      throw new Error(response.data.message || 'Failed to update status');
    } catch (error) {
      throw error;
    }
  }

  // Get active ride ID
  getActiveRideId() {
    return this.activeRideId;
  }
}

export default new RideRequestService();
