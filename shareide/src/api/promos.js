import apiClient from './client';

export const promosAPI = {
  getPromoCodes: async () => {
    const response = await apiClient.get('/promos');
    return response.data;
  },

  applyPromoCode: async (code) => {
    const response = await apiClient.post('/promos/apply', { code });
    return response.data;
  },

  validatePromoCode: async (code, rideAmount) => {
    const response = await apiClient.post('/promos/validate', {
      code,
      ride_amount: rideAmount,
    });
    return response.data;
  },

  getActivePromos: async () => {
    const response = await apiClient.get('/promos/active');
    return response.data;
  },
};
