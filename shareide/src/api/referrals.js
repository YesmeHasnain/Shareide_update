import apiClient from './client';

export const referralsAPI = {
  getReferralCode: async () => {
    const response = await apiClient.get('/referrals/my-code');
    return response.data;
  },

  applyReferralCode: async (code) => {
    const response = await apiClient.post('/referrals/apply', { code });
    return response.data;
  },

  getReferralHistory: async () => {
    const response = await apiClient.get('/referrals/history');
    return response.data;
  },
};
