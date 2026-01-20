import apiClient from './client';

export const walletAPI = {
  getBalance: async () => {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  },

  getTransactions: async (page = 1) => {
    const response = await apiClient.get(`/wallet/transactions?page=${page}`);
    return response.data;
  },

  topup: async (amount, paymentMethod) => {
    const response = await apiClient.post('/wallet/topup', {
      amount,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  withdraw: async (amount, bankDetails) => {
    const response = await apiClient.post('/wallet/withdraw', {
      amount,
      bank_name: bankDetails.bankName,
      account_number: bankDetails.accountNumber,
      account_title: bankDetails.accountTitle,
    });
    return response.data;
  },

  getPaymentMethods: async () => {
    const response = await apiClient.get('/wallet/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (cardDetails) => {
    const response = await apiClient.post('/wallet/payment-methods', cardDetails);
    return response.data;
  },

  deletePaymentMethod: async (id) => {
    const response = await apiClient.delete(`/wallet/payment-methods/${id}`);
    return response.data;
  },
};
