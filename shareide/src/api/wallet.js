import apiClient from './client';

export const walletAPI = {
  // Get wallet balance and stats
  getBalance: async () => {
    const response = await apiClient.get('/rider-wallet/balance');
    return response.data;
  },

  // Get transaction history
  getTransactions: async (page = 1, perPage = 20) => {
    const response = await apiClient.get(`/rider-wallet/transactions?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Initiate wallet top-up
  // Supports: 'card', 'alfa_wallet', 'bank_account', 'jazzcash', 'easypaisa'
  topUp: async (amount, method, accountNumber = null) => {
    const payload = {
      amount,
      method,
    };

    // Add account number for Alfa Wallet / Bank Account methods
    if (accountNumber && (method === 'alfa_wallet' || method === 'bank_account')) {
      payload.account_number = accountNumber;
    }

    const response = await apiClient.post('/rider-wallet/topup', payload);
    return response.data;
  },

  // Verify OTP for Alfa Wallet / Bank Account payments
  verifyOTP: async (orderId, otp) => {
    const response = await apiClient.post('/rider-wallet/verify-otp', {
      order_id: orderId,
      otp,
    });
    return response.data;
  },

  // Get saved payment methods
  getPaymentMethods: async () => {
    const response = await apiClient.get('/rider-wallet/payment-methods');
    return response.data;
  },

  // Add new payment method
  addPaymentMethod: async (data) => {
    const response = await apiClient.post('/rider-wallet/payment-methods', data);
    return response.data;
  },

  // Set default payment method
  setDefaultMethod: async (id) => {
    const response = await apiClient.post(`/rider-wallet/payment-methods/${id}/default`);
    return response.data;
  },

  // Delete payment method
  deletePaymentMethod: async (id) => {
    const response = await apiClient.delete(`/rider-wallet/payment-methods/${id}`);
    return response.data;
  },
};
