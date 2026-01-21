import apiClient from './client';

export const authAPI = {
  // Send OTP via WhatsApp
  sendCode: async (phone) => {
    const response = await apiClient.post('/auth/send-code', { phone });
    return response.data;
  },

  // Verify OTP code
  verifyCode: async (phone, code) => {
    const response = await apiClient.post('/auth/verify-code', { phone, code });
    return response.data;
  },

  // Complete registration for new users
  completeRegistration: async (data) => {
    const response = await apiClient.post('/auth/complete-registration', data);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/logout');
    return response.data;
  },
};
