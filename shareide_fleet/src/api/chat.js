import client from './client';

export const chatAPI = {
  // Get all conversations
  getConversations: async () => {
    return await client.get('/messages/conversations');
  },

  // Get conversation messages
  getMessages: async (conversationId, page = 1) => {
    return await client.get(`/messages/conversations/${conversationId}?page=${page}`);
  },

  // Send message
  sendMessage: async (conversationId, message) => {
    return await client.post(`/messages/send`, {
      conversation_id: conversationId,
      message,
    });
  },

  // Start conversation
  startConversation: async (recipientId) => {
    return await client.post('/messages/conversations/start', {
      recipient_id: recipientId,
    });
  },

  // Mark as read
  markAsRead: async (conversationId) => {
    return await client.post(`/messages/conversations/${conversationId}/read`);
  },
};