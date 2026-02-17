import apiClient from './client';

const API_BASE = 'https://api.shareide.com/api';

/**
 * Send a message to the AI chatbot
 */
export const sendChatbotMessage = async (message, conversationHistory = []) => {
  const response = await apiClient.post('/chatbot/message', {
    message,
    conversation_history: conversationHistory,
    source: 'app_shareide',
  });
  return response.data;
};

/**
 * Create a support ticket (authenticated user)
 */
export const createTicket = async ({ subject, message, category, priority, source }) => {
  const response = await apiClient.post('/support/create', {
    subject,
    message,
    category: category || 'other',
    priority: priority || 'medium',
    source: source || 'chatbot_app_shareide',
  });
  return response.data;
};

/**
 * Get all messages for a ticket (by reply token)
 */
export const getMessages = async (replyToken) => {
  const response = await apiClient.get(`/support/ticket/${replyToken}`);
  return response.data;
};

/**
 * Poll for new messages since a given message ID
 */
export const pollNewMessages = async (replyToken, afterId = 0) => {
  const response = await apiClient.get(`/support/ticket/${replyToken}/messages?after=${afterId}`);
  return response.data;
};

/**
 * Reply to a ticket
 */
export const replyToTicket = async (replyToken, message) => {
  const response = await apiClient.post(`/support/ticket/${replyToken}/reply`, { message });
  return response.data;
};

/**
 * Upload an attachment to a ticket
 */
export const uploadAttachment = async (replyToken, file, message = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (message) formData.append('message', message);

  const response = await apiClient.post(`/support/ticket/${replyToken}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Send typing signal
 */
export const sendTypingSignal = async (replyToken) => {
  const response = await apiClient.post(`/support/ticket/${replyToken}/typing`);
  return response.data;
};

/**
 * Send activity ping (online status)
 */
export const sendActivityPing = async (replyToken) => {
  const response = await apiClient.post(`/support/ticket/${replyToken}/activity`);
  return response.data;
};

/**
 * Mark user as offline
 */
export const goOffline = async (replyToken) => {
  const response = await apiClient.post(`/support/ticket/${replyToken}/offline`);
  return response.data;
};
