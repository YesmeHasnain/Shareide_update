import client from './client';

export const rideAPI = {
  // Get available rides (for driver)
  getAvailableRides: async () => {
    return await client.get('/rides/available');
  },

  // Accept ride
  acceptRide: async (rideId) => {
    return await client.post(`/driver/rides/${rideId}/accept`);
  },

  // Update ride status
  updateRideStatus: async (rideId, status) => {
    return await client.post(`/driver/rides/${rideId}/status`, { status });
  },

  // Get active ride
  getActiveRide: async () => {
    return await client.get('/driver/rides/active');
  },

  // Get my rides
  getMyRides: async () => {
    return await client.get('/rides/my');
  },

  // Get ride details
  getRideDetails: async (rideId) => {
    return await client.get(`/rides/${rideId}`);
  },

  // Update location
  updateLocation: async (latitude, longitude) => {
    return await client.post('/driver/location', {
      latitude,
      longitude,
    });
  },

  // Update driver status (online/offline)
  updateDriverStatus: async (isOnline, lat = null, lng = null) => {
    return await client.post('/driver/status', {
      is_online: isOnline,
      lat,
      lng,
    });
  },

  // Get driver stats (earnings, rides count, rating)
  getDriverStats: async () => {
    return await client.get('/driver/stats');
  },

  // Get driver profile
  getDriverProfile: async () => {
    return await client.get('/driver/profile');
  },
};