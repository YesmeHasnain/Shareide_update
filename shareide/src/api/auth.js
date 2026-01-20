import apiClient from './client';

export const authAPI = {
  sendOTP: async (phone) => {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  },

  verifyOTP: async (phone, code) => {
    const response = await apiClient.post('/auth/verify-otp', { phone, code });
    return response.data;
  },

  completeRegistration: async (formData) => {
    const response = await apiClient.post('/auth/complete-registration', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
