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
  requestWithdrawal: async (amount, method, accountTitle, accountNumber, bankName = null) => {
    const payload = {
      amount,
      method,
      account_title: accountTitle,
      account_number: accountNumber.replace(/\s+/g, ''),
    };
    if (bankName) payload.bank_name = bankName;
    const response = await client.post('/wallet/withdraw', payload);
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

  // Initiate wallet top-up
  topUp: async (amount, method) => {
    const response = await client.post('/wallet/topup', { amount, method });
    return response.data;
  },

  // Verify OTP for payment
  verifyOTP: async (orderId, otp) => {
    const response = await client.post('/wallet/verify-otp', {
      order_id: orderId,
      otp,
    });
    return response.data;
  },

  // Get saved payment methods
  getPaymentMethods: async () => {
    const response = await client.get('/wallet/payment-methods');
    return response.data;
  },

  // Set withdraw PIN
  setWithdrawPIN: async (pin) => {
    const response = await client.post('/wallet/set-pin', { pin });
    return response.data;
  },

  // Verify withdraw PIN
  verifyWithdrawPIN: async (pin) => {
    const response = await client.post('/wallet/verify-pin', { pin });
    return response.data;
  },
};
