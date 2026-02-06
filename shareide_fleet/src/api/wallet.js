import client from './client';

export const walletAPI = {
  // Get wallet balance
  getBalance: async () => {
    const response = await client.get('/wallet/balance');
    return response.data;
  },

  // Get transactions
  getTransactions: async (page = 1) => {
    const response = await client.get(`/wallet/transactions?page=${page}`);
    return response.data;
  },

  // Get earnings stats
  getEarnings: async () => {
    const response = await client.get('/wallet/earnings');
    return response.data;
  },

  // Request withdrawal
  requestWithdrawal: async (data) => {
    const response = await client.post('/wallet/withdraw', data);
    return response.data;
  },

  // Get withdrawals
  getWithdrawals: async () => {
    const response = await client.get('/wallet/withdrawals');
    return response.data;
  },

  // Cancel withdrawal
  cancelWithdrawal: async (id) => {
    const response = await client.post(`/wallet/withdrawals/${id}/cancel`);
    return response.data;
  },
};