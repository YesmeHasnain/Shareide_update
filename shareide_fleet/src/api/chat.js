import client from './client';

export const chatAPI = {
  // Get all conversations
  getConversations: async () => {
    const response = await client.get('/messages/conversations');
    return response.data;
  },

  // Get conversation messages
  getMessages: async (conversationId, page = 1) => {
    const response = await client.get(`/messages/conversations/${conversationId}?page=${page}`);
    return response.data;
  },

  // Send message
  sendMessage: async (conversationId, message) => {
    const response = await client.post(`/messages/send`, {
      conversation_id: conversationId,
      message,
    });
    return response.data;
  },

  // Start conversation
  startConversation: async (recipientId) => {
    const response = await client.post('/messages/conversations/start', {
      recipient_id: recipientId,
    });
    return response.data;
  },

  // Mark as read
  markAsRead: async (conversationId) => {
    const response = await client.post(`/messages/conversations/${conversationId}/read`);
    return response.data;
  },
};