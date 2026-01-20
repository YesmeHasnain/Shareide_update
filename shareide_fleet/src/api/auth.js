import client from './client';

export const authAPI = {
  // Send OTP
  sendOTP: async (phone) => {
    return await client.post('/auth/send-code', { phone });
  },

  // Verify OTP
  verifyOTP: async (phone, code) => {
    return await client.post('/auth/verify-code', { phone, code });
  },

  // Get current user
  getMe: async () => {
    return await client.get('/me');
  },

  // Logout
  logout: async () => {
    return await client.post('/logout');
  },
};