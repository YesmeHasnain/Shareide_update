import apiClient from './client';

export const profileAPI = {
  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  updateProfilePicture: async (formData) => {
    const response = await apiClient.post('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getSavedPlaces: async () => {
    const response = await apiClient.get('/profile/saved-places');
    return response.data;
  },

  addSavedPlace: async (name, address, lat, lng, type = 'other') => {
    const response = await apiClient.post('/profile/saved-places', {
      name,
      address,
      latitude: lat,
      longitude: lng,
      type,
    });
    return response.data;
  },

  updateSavedPlace: async (id, data) => {
    const response = await apiClient.put(`/profile/saved-places/${id}`, data);
    return response.data;
  },

  deleteSavedPlace: async (id) => {
    const response = await apiClient.delete(`/profile/saved-places/${id}`);
    return response.data;
  },

  getEmergencyContacts: async () => {
    const response = await apiClient.get('/profile/emergency-contacts');
    return response.data;
  },

  addEmergencyContact: async (name, phone, relationship) => {
    const response = await apiClient.post('/profile/emergency-contacts', {
      name,
      phone,
      relationship,
    });
    return response.data;
  },

  deleteEmergencyContact: async (id) => {
    const response = await apiClient.delete(`/profile/emergency-contacts/${id}`);
    return response.data;
  },

  getNotificationSettings: async () => {
    const response = await apiClient.get('/profile/notification-settings');
    return response.data;
  },

  updateNotificationSettings: async (settings) => {
    const response = await apiClient.put('/profile/notification-settings', settings);
    return response.data;
  },

  deleteAccount: async (reason) => {
    const response = await apiClient.delete('/profile/delete-account', {
      data: { reason },
    });
    return response.data;
  },
};
