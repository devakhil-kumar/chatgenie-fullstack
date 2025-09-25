import api from './api';

export const chatAPI = {
  // Get all chats for current user
  getChats: async () => {
    return await api.get('/chats');
  },

  // Get messages for a specific chat
  getMessages: async (chatId, page = 1, limit = 50) => {
    return await api.get(`/chats/${chatId}/messages`, {
      params: { page, limit }
    });
  },

  // Send a message
  sendMessage: async (chatId, content, type = 'text') => {
    return await api.post(`/chats/${chatId}/messages`, {
      content,
      type
    });
  },

  // Create new chat
  createChat: async (participantIds) => {
    return await api.post('/chats', { participantIds });
  },

  // Upload media file
  uploadMedia: async (chatId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    return await api.post(`/chats/${chatId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Mark messages as read
  markAsRead: async (chatId, messageIds) => {
    return await api.post(`/chats/${chatId}/read`, { messageIds });
  },

  // Add reaction to message
  addReaction: async (chatId, messageId, emoji) => {
    return await api.post(`/chats/${chatId}/messages/${messageId}/reaction`, {
      emoji
    });
  },

  // Remove reaction from message
  removeReaction: async (chatId, messageId) => {
    return await api.delete(`/chats/${chatId}/messages/${messageId}/reaction`);
  },

  // Delete message
  deleteMessage: async (chatId, messageId) => {
    return await api.delete(`/chats/${chatId}/messages/${messageId}`);
  },

  // Get AI suggestions
  getAISuggestions: async (message, tone, context) => {
    return await api.post('/ai/suggestions', {
      message,
      tone,
      context
    });
  },

  // Generate AI reply
  generateAIReply: async (chatId, messageId, tone) => {
    return await api.post('/ai/generate-reply', {
      chatId,
      messageId,
      tone
    });
  },

  // Search messages
  searchMessages: async (query, chatId = null) => {
    return await api.get('/chats/search', {
      params: { query, chatId }
    });
  },

  // Get chat info
  getChatInfo: async (chatId) => {
    return await api.get(`/chats/${chatId}/info`);
  },

  // Update chat settings
  updateChatSettings: async (chatId, settings) => {
    return await api.put(`/chats/${chatId}/settings`, settings);
  },

  // Leave chat
  leaveChat: async (chatId) => {
    return await api.post(`/chats/${chatId}/leave`);
  },

  // Block user
  blockUser: async (userId) => {
    return await api.post('/users/block', { userId });
  },

  // Unblock user
  unblockUser: async (userId) => {
    return await api.post('/users/unblock', { userId });
  },
};