import client from './client';

export const authAPI = {
  // Send OTP
  sendOTP: async (phone) => {
    const response = await client.post('/auth/send-code', { phone });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (phone, code) => {
    const response = await client.post('/auth/verify-code', { phone, code });
    return response.data;
  },

  // Complete registration for new users
  completeRegistration: async (data) => {
    const response = await client.post('/auth/complete-registration', data);
    return response.data;
  },

  // Get current user
  getMe: async () => {
    const response = await client.get('/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await client.post('/logout');
    return response.data;
  },
};