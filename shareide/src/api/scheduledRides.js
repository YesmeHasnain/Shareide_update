import client from './client';

/**
 * Get all scheduled rides
 * @param {string} status - Filter by status (optional)
 */
export const getScheduledRides = async (status = null) => {
  const params = status ? { status } : {};
  const response = await client.get('/scheduled-rides', { params });
  return response.data;
};

/**
 * Create a new scheduled ride
 * @param {Object} data - Scheduled ride data
 */
export const createScheduledRide = async (data) => {
  const response = await client.post('/scheduled-rides', data);
  return response.data;
};

/**
 * Get a single scheduled ride
 * @param {number} id - Scheduled ride ID
 */
export const getScheduledRide = async (id) => {
  const response = await client.get(`/scheduled-rides/${id}`);
  return response.data;
};

/**
 * Update a scheduled ride
 * @param {number} id - Scheduled ride ID
 * @param {Object} data - Updated data
 */
export const updateScheduledRide = async (id, data) => {
  const response = await client.put(`/scheduled-rides/${id}`, data);
  return response.data;
};

/**
 * Cancel a scheduled ride
 * @param {number} id - Scheduled ride ID
 */
export const cancelScheduledRide = async (id) => {
  const response = await client.delete(`/scheduled-rides/${id}`);
  return response.data;
};

/**
 * Get upcoming scheduled rides count
 */
export const getUpcomingCount = async () => {
  const response = await client.get('/scheduled-rides/upcoming-count');
  return response.data;
};

export default {
  getScheduledRides,
  createScheduledRide,
  getScheduledRide,
  updateScheduledRide,
  cancelScheduledRide,
  getUpcomingCount,
};
