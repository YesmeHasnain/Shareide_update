import apiClient from './client';

// Search shared rides
export const searchSharedRides = async (params) => {
  const response = await apiClient.get('/shared-rides/search', { params });
  return response.data;
};

// Get ride details
export const getSharedRide = async (id) => {
  const response = await apiClient.get(`/shared-rides/${id}`);
  return response.data;
};

// Book seats on a shared ride
export const bookSharedRide = async (rideId, data) => {
  const response = await apiClient.post(`/shared-rides/${rideId}/book`, data);
  return response.data;
};

// Confirm booking (after driver accepts)
export const confirmBooking = async (bookingId, paymentMethod) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/confirm`, {
    payment_method: paymentMethod,
  });
  return response.data;
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/cancel`);
  return response.data;
};

// Rate driver after ride
export const rateSharedRideDriver = async (bookingId, rating, review) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/rate`, {
    rating,
    review,
  });
  return response.data;
};

// Get my bookings (as passenger)
export const getMySharedBookings = async (status) => {
  const response = await apiClient.get('/shared-rides/my-bookings', {
    params: status ? { status } : {},
  });
  return response.data;
};

// ============================================
// DRIVER FUNCTIONS
// ============================================

// Create a shared ride
export const createSharedRide = async (data) => {
  const response = await apiClient.post('/shared-rides/create', data);
  return response.data;
};

// Get my posted rides (as driver)
export const getMySharedRides = async (status) => {
  const response = await apiClient.get('/shared-rides/my-rides', {
    params: status ? { status } : {},
  });
  return response.data;
};

// Get pending booking requests
export const getPendingRequests = async () => {
  const response = await apiClient.get('/shared-rides/pending-requests');
  return response.data;
};

// Accept booking request
export const acceptBookingRequest = async (bookingId) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/accept`);
  return response.data;
};

// Reject booking request
export const rejectBookingRequest = async (bookingId) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/reject`);
  return response.data;
};

// Start ride
export const startSharedRide = async (rideId) => {
  const response = await apiClient.post(`/shared-rides/${rideId}/start`);
  return response.data;
};

// Complete ride
export const completeSharedRide = async (rideId) => {
  const response = await apiClient.post(`/shared-rides/${rideId}/complete`);
  return response.data;
};

// Cancel ride
export const cancelSharedRide = async (rideId) => {
  const response = await apiClient.post(`/shared-rides/${rideId}/cancel`);
  return response.data;
};

// Pickup passenger
export const pickupPassenger = async (bookingId) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/pickup`);
  return response.data;
};

// Dropoff passenger
export const dropoffPassenger = async (bookingId) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/dropoff`);
  return response.data;
};

// Rate passenger
export const ratePassenger = async (bookingId, rating, review) => {
  const response = await apiClient.post(`/shared-rides/bookings/${bookingId}/rate-passenger`, {
    rating,
    review,
  });
  return response.data;
};
