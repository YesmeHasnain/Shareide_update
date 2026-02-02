import apiClient from './client';

export const loyaltyAPI = {
  // Get user's loyalty dashboard
  getDashboard: async () => {
    const response = await apiClient.get('/loyalty/dashboard');
    return response.data;
  },

  // Get all tiers
  getTiers: async () => {
    const response = await apiClient.get('/loyalty/tiers');
    return response.data;
  },

  // Get points history
  getPointsHistory: async (page = 1) => {
    const response = await apiClient.get(`/loyalty/points-history?page=${page}`);
    return response.data;
  },

  // Get available rewards
  getRewards: async () => {
    const response = await apiClient.get('/loyalty/rewards');
    return response.data;
  },

  // Redeem a reward
  redeemReward: async (rewardId) => {
    const response = await apiClient.post(`/loyalty/rewards/${rewardId}/redeem`);
    return response.data;
  },

  // Get user's redemptions
  getMyRedemptions: async () => {
    const response = await apiClient.get('/loyalty/my-redemptions');
    return response.data;
  },

  // Get all achievements
  getAchievements: async () => {
    const response = await apiClient.get('/loyalty/achievements');
    return response.data;
  },

  // Get user's achievements
  getMyAchievements: async () => {
    const response = await apiClient.get('/loyalty/my-achievements');
    return response.data;
  },
};

export default loyaltyAPI;
