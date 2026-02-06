import client from './client';

export const scheduleAPI = {
  // Get all schedules
  getSchedules: async () => {
    const response = await client.get('/schedules');
    return response.data;
  },

  // Create schedule
  createSchedule: async (data) => {
    const response = await client.post('/schedules', data);
    return response.data;
  },

  // Update schedule
  updateSchedule: async (id, data) => {
    const response = await client.put(`/schedules/${id}`, data);
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    const response = await client.delete(`/schedules/${id}`);
    return response.data;
  },

  // Toggle schedule active status
  toggleSchedule: async (id) => {
    const response = await client.post(`/schedules/${id}/toggle`);
    return response.data;
  },
};