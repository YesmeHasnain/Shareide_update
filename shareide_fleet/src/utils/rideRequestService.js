import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './notificationService';
import { pusherService } from './pusherService';
import client from '../api/client';

const POLL_INTERVAL = 10000; // 10 seconds (reduced from 5s since we have real-time)

class RideRequestService {
  constructor() {
    this.isPolling = false;
    this.pollInterval = null;
    this.onNewRideRequest = null;
    this.onRideUpdate = null;
    this.activeRideId = null;
    this.appState = AppState.currentState;
    this.userChannel = null;
    this.rideChannel = null;
    this.queuedRequests = [];
    this.declinedIds = new Set();
    this.knownIds = new Set();
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

    // Setup real-time Pusher subscription
    this.setupRealTime();

    console.log('Ride request service started');
  }

  // Setup real-time Pusher subscription for ride updates
  async setupRealTime() {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const user = userData ? JSON.parse(userData) : null;
      if (!user?.id) return;

      // Subscribe to user's personal channel for ride notifications
      this.userChannel = await pusherService.subscribe(`user.${user.id}`);
      if (this.userChannel) {
        this.userChannel.bind('ride.status.changed', (data) => {
          console.log('Real-time ride update:', data.status);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          if (this.onRideUpdate) {
            this.onRideUpdate(data);
          }
          // Also refresh ride requests
          this.checkForRideRequests();
        });
      }
    } catch (error) {
      console.log('Real-time setup failed, using polling:', error.message);
    }
  }

  // Subscribe to a specific ride channel (call when accepting a ride)
  async subscribeToRide(rideId) {
    try {
      this.rideChannel = await pusherService.subscribe(`ride.${rideId}`);
      if (this.rideChannel) {
        this.rideChannel.bind('ride.status.changed', (data) => {
          if (this.onRideUpdate) this.onRideUpdate(data);
        });
      }
    } catch (error) {
      console.log('Failed to subscribe to ride channel:', error.message);
    }
  }

  // Stop polling and real-time
  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    // Clean up Pusher subscriptions
    if (this.userChannel) {
      this.userChannel.unbind_all();
      this.userChannel = null;
    }
    if (this.rideChannel) {
      this.rideChannel.unbind_all();
      this.rideChannel = null;
    }

    this.isPolling = false;
    this.onNewRideRequest = null;
    this.onRideUpdate = null;
    this.queuedRequests = [];
    this.declinedIds.clear();
    this.knownIds.clear();

    console.log('Ride request service stopped');
  }

  // Mark a request as declined so it won't reappear
  markDeclined(requestId) {
    this.declinedIds.add(requestId);
    this.queuedRequests = this.queuedRequests.filter(r => r.id !== requestId);
  }

  // Get current queued requests
  getQueuedRequests() {
    return this.queuedRequests;
  }

  // Clear queue (e.g. after accepting a ride)
  clearQueue() {
    this.queuedRequests = [];
  }

  // Check for new ride requests
  async checkForRideRequests() {
    try {
      const response = await client.get('/driver/pending-requests');

      if (response.data.success) {
        const requests = response.data.data || [];

        // Filter out already declined and already queued requests
        let hasNew = false;
        for (const req of requests) {
          if (!this.declinedIds.has(req.id) && !this.knownIds.has(req.id)) {
            this.queuedRequests.push(req);
            this.knownIds.add(req.id);
            hasNew = true;
          }
        }

        // Remove queued requests that are no longer in the server response
        const serverIds = new Set(requests.map(r => r.id));
        this.queuedRequests = this.queuedRequests.filter(r => serverIds.has(r.id));

        // Notify with the full queue
        if (this.queuedRequests.length > 0 && this.onNewRideRequest) {
          if (hasNew) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          this.onNewRideRequest([...this.queuedRequests]);
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
        this.subscribeToRide(rideId);
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
