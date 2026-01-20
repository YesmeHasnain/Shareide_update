import client from './client';

export const scheduleAPI = {
  // Get all schedules
  getSchedules: async () => {
    return await client.get('/schedules');
  },

  // Create schedule
  createSchedule: async (data) => {
    return await client.post('/schedules', data);
  },

  // Update schedule
  updateSchedule: async (id, data) => {
    return await client.put(`/schedules/${id}`, data);
  },

  // Delete schedule
  deleteSchedule: async (id) => {
    return await client.delete(`/schedules/${id}`);
  },

  // Toggle schedule active status
  toggleSchedule: async (id) => {
    return await client.post(`/schedules/${id}/toggle`);
  },
};