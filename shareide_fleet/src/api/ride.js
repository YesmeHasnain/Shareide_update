import client from './client';

export const rideAPI = {
  // Get available rides (for driver)
  getAvailableRides: async () => {
    const response = await client.get('/rides/available');
    return response.data;
  },

  // Accept ride
  acceptRide: async (rideId) => {
    const response = await client.post(`/driver/rides/${rideId}/accept`);
    return response.data;
  },

  // Update ride status
  updateRideStatus: async (rideId, status) => {
    const response = await client.post(`/driver/rides/${rideId}/status`, { status });
    return response.data;
  },

  // Get active ride
  getActiveRide: async () => {
    const response = await client.get('/driver/rides/active');
    return response.data;
  },

  // Get my rides
  getMyRides: async () => {
    const response = await client.get('/rides/my');
    return response.data;
  },

  // Get ride details
  getRideDetails: async (rideId) => {
    const response = await client.get(`/rides/${rideId}`);
    return response.data;
  },

  // Update location
  updateLocation: async (latitude, longitude) => {
    const response = await client.post('/driver/location', {
      latitude,
      longitude,
    });
    return response.data;
  },

  // Update driver status (online/offline)
  updateDriverStatus: async (isOnline, lat = null, lng = null) => {
    const response = await client.post('/driver/status', {
      is_online: isOnline,
      lat,
      lng,
    });
    return response.data;
  },

  // Get driver stats (earnings, rides count, rating)
  getDriverStats: async () => {
    const response = await client.get('/driver/stats');
    return response.data;
  },

  // Get driver profile
  getDriverProfile: async () => {
    const response = await client.get('/driver/profile');
    return response.data;
  },

  // Get ride history
  getRideHistory: async (page = 1, status = null) => {
    const params = { page };
    if (status) params.status = status;
    const response = await client.get('/rides/history', { params });
    return response.data;
  },

  // Rate a rider after completing a ride
  rateRider: async (rideId, rating, comment = '', tags = [], negativeReason = undefined) => {
    const body = { rating, comment, tags };
    if (negativeReason) {
      body.negative_reason = negativeReason;
    }
    const response = await client.post(`/ratings/rides/${rideId}/rate-rider`, body);
    return response.data;
  },
};