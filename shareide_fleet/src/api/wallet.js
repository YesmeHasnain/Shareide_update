import client from './client';

export const walletAPI = {
  // Get wallet balance
  getBalance: async () => {
    return await client.get('/wallet/balance');
  },

  // Get transactions
  getTransactions: async (page = 1) => {
    return await client.get(`/wallet/transactions?page=${page}`);
  },

  // Get earnings stats
  getEarnings: async () => {
    return await client.get('/wallet/earnings');
  },

  // Request withdrawal
  requestWithdrawal: async (data) => {
    return await client.post('/wallet/withdraw', data);
  },

  // Get withdrawals
  getWithdrawals: async () => {
    return await client.get('/wallet/withdrawals');
  },

  // Cancel withdrawal
  cancelWithdrawal: async (id) => {
    return await client.post(`/wallet/withdrawals/${id}/cancel`);
  },
};