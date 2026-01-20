import apiClient from './client';

export const ridesAPI = {
  getAvailableDrivers: async (pickup, dropoff) => {
    const response = await apiClient.post('/rides/available', {
      pickup_lat: pickup.latitude,
      pickup_lng: pickup.longitude,
      pickup_address: pickup.address,
      dropoff_lat: dropoff.latitude,
      dropoff_lng: dropoff.longitude,
      dropoff_address: dropoff.address,
    });
    return response.data;
  },

  bookRide: async (data) => {
    const response = await apiClient.post('/rides/book', {
      driver_id: data.driverId,
      pickup_location: data.pickup,
      dropoff_location: data.dropoff,
      fare: data.fare,
      payment_method: data.paymentMethod,
      promo_code: data.promoCode,
    });
    return response.data;
  },

  getActiveRide: async () => {
    const response = await apiClient.get('/rides/active');
    return response.data;
  },

  getRideHistory: async (page = 1) => {
    const response = await apiClient.get(`/rides/history?page=${page}`);
    return response.data;
  },

  getRideDetails: async (rideId) => {
    const response = await apiClient.get(`/rides/${rideId}`);
    return response.data;
  },

  cancelRide: async (rideId, reason) => {
    const response = await apiClient.post(`/rides/${rideId}/cancel`, { reason });
    return response.data;
  },

  rateRide: async (rideId, rating, comment, tags) => {
    const response = await apiClient.post(`/rides/${rideId}/rate`, {
      rating,
      comment,
      tags,
    });
    return response.data;
  },

  getDriverLocation: async (rideId) => {
    const response = await apiClient.get(`/rides/${rideId}/driver-location`);
    return response.data;
  },

  sendMessage: async (rideId, message) => {
    const response = await apiClient.post(`/rides/${rideId}/message`, { message });
    return response.data;
  },
};
