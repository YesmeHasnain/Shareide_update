import apiClient from './client';

export const ridesAPI = {
  // Get available drivers near pickup location
  getAvailableDrivers: async (pickup, dropoff, vehicleType = null) => {
    const params = {
      pickup_lat: pickup.latitude,
      pickup_lng: pickup.longitude,
      dropoff_lat: dropoff.latitude,
      dropoff_lng: dropoff.longitude,
    };

    if (vehicleType) {
      params.vehicle_type = vehicleType;
    }

    const response = await apiClient.get('/rides/available', { params });
    return response.data;
  },

  // Book a ride with a specific driver
  bookRide: async (data) => {
    const response = await apiClient.post('/rides/book', {
      driver_id: data.driverId,
      pickup_address: data.pickup?.address || data.pickup,
      pickup_lat: data.pickup?.latitude,
      pickup_lng: data.pickup?.longitude,
      drop_address: data.dropoff?.address || data.dropoff,
      drop_lat: data.dropoff?.latitude,
      drop_lng: data.dropoff?.longitude,
      fare: data.fare,
      payment_method: data.paymentMethod || 'cash',
      promo_code: data.promoCode || null,
      notes: data.notes || null,
      seats: data.seats || 1,
    });
    return response.data;
  },

  // Get current active ride
  getActiveRide: async () => {
    const response = await apiClient.get('/rides/active');
    return response.data;
  },

  // Get ride history
  getRideHistory: async (page = 1, status = null) => {
    const params = { page };
    if (status) {
      params.status = status;
    }
    const response = await apiClient.get('/rides/history', { params });
    return response.data;
  },

  // Get specific ride details
  getRideDetails: async (rideId) => {
    const response = await apiClient.get(`/rides/${rideId}`);
    return response.data;
  },

  // Cancel a ride
  cancelRide: async (rideId, reason = 'User cancelled') => {
    const response = await apiClient.post(`/rides/${rideId}/cancel`, { reason });
    return response.data;
  },

  // Rate a completed ride
  rateRide: async (rideId, rating, comment = '', tags = [], negativeReason = undefined) => {
    const body = { rating, comment, tags };
    if (negativeReason) {
      body.negative_reason = negativeReason;
    }
    const response = await apiClient.post(`/ratings/rides/${rideId}/rate-driver`, body);
    return response.data;
  },

  // Get driver's current location during ride
  getDriverLocation: async (rideId) => {
    const response = await apiClient.get(`/rides/${rideId}/driver-location`);
    return response.data;
  },

  // Create a new ride request
  createRide: async (data) => {
    const response = await apiClient.post('/rides/create', {
      pickup_location: data.pickup?.address,
      dropoff_location: data.dropoff?.address,
      pickup_lat: data.pickup?.latitude,
      pickup_lng: data.pickup?.longitude,
      dropoff_lat: data.dropoff?.latitude,
      dropoff_lng: data.dropoff?.longitude,
      ride_type: data.rideType || 'rider',
      seats_available: data.seats,
      scheduled_time: data.scheduledTime,
    });
    return response.data;
  },

  // Get user's created rides
  getMyRides: async () => {
    const response = await apiClient.get('/rides/my');
    return response.data;
  },

  // Get available vehicle types with dynamic seat counts from drivers
  getVehicleTypes: async (pickupLat = null, pickupLng = null) => {
    const params = {};
    if (pickupLat && pickupLng) {
      params.pickup_lat = pickupLat;
      params.pickup_lng = pickupLng;
    }
    const response = await apiClient.get('/rides/vehicle-types', { params });
    return response.data;
  },

  // ============================================
  // BIDDING / UPSALE FEATURE
  // ============================================

  // Search drivers with bidding support
  searchWithBidding: async (pickup, dropoff, vehicleType = null, bidPercentage = 0) => {
    const params = {
      pickup_lat: pickup.latitude,
      pickup_lng: pickup.longitude,
      dropoff_lat: dropoff.latitude,
      dropoff_lng: dropoff.longitude,
      bid_percentage: bidPercentage,
    };

    if (vehicleType) {
      params.vehicle_type = vehicleType;
    }

    const response = await apiClient.get('/rides/search-with-bidding', { params });
    return response.data;
  },

  // Book a ride with bid
  bookRideWithBid: async (data) => {
    const response = await apiClient.post('/rides/book-with-bid', {
      driver_id: data.driverId,
      pickup_address: data.pickup?.address || data.pickup,
      pickup_lat: data.pickup?.latitude,
      pickup_lng: data.pickup?.longitude,
      drop_address: data.dropoff?.address || data.dropoff,
      drop_lat: data.dropoff?.latitude,
      drop_lng: data.dropoff?.longitude,
      base_fare: data.baseFare,
      bid_percentage: data.bidPercentage || 0,
      payment_method: data.paymentMethod || 'cash',
      promo_code: data.promoCode || null,
      notes: data.notes || null,
      seats: data.seats || 1,
    });
    return response.data;
  },

  // Get bid options for a ride
  getBidOptions: async (rideId) => {
    const response = await apiClient.get(`/rides/${rideId}/bid-options`);
    return response.data;
  },

  // Increase bid for a ride
  increaseBid: async (rideId, bidPercentage) => {
    const response = await apiClient.post(`/rides/${rideId}/increase-bid`, {
      bid_percentage: bidPercentage,
    });
    return response.data;
  },
};
