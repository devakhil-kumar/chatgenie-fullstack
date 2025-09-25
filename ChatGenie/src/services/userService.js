import api from './api';

export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update user profile
  updateProfile: async (updates) => {
    return await api.put('/users/profile', updates);
  },

  // Upload avatar
  uploadAvatar: async (imageUri) => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    });

    return await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get user contacts
  getContacts: async () => {
    return await api.get('/users/contacts');
  },

  // Sync phone contacts
  syncContacts: async (phoneNumbers) => {
    return await api.post('/users/sync-contacts', { phoneNumbers });
  },

  // Search users
  searchUsers: async (query) => {
    return await api.get('/users/search', {
      params: { query }
    });
  },

  // Get user by phone
  getUserByPhone: async (phone) => {
    return await api.get(`/users/phone/${phone}`);
  },

  // Get user settings
  getSettings: async () => {
    return await api.get('/users/settings');
  },

  // Update user settings
  updateSettings: async (settings) => {
    return await api.put('/users/settings', settings);
  },

  // Get referral stats
  getReferralStats: async () => {
    return await api.get('/users/referral-stats');
  },

  // Generate referral link
  generateReferralLink: async () => {
    return await api.post('/users/generate-referral-link');
  },

  // Get referral leaderboard
  getReferralLeaderboard: async () => {
    return await api.get('/users/referral-leaderboard');
  },

  // Claim referral reward
  claimReferralReward: async (referralId) => {
    return await api.post('/users/claim-referral-reward', { referralId });
  },

  // Report user
  reportUser: async (userId, reason, description) => {
    return await api.post('/users/report', {
      userId,
      reason,
      description
    });
  },

  // Delete account
  deleteAccount: async (password) => {
    return await api.delete('/users/account', {
      data: { password }
    });
  },

  // Export user data
  exportData: async () => {
    return await api.get('/users/export-data');
  },

  // Get AI usage stats
  getAIUsageStats: async () => {
    return await api.get('/users/ai-usage');
  },

  // Purchase AI credits
  purchaseCredits: async (amount, paymentMethod) => {
    return await api.post('/users/purchase-credits', {
      amount,
      paymentMethod
    });
  },

  // Get premium subscription status
  getPremiumStatus: async () => {
    return await api.get('/users/premium-status');
  },

  // Subscribe to premium
  subscribeToPremium: async (planId, paymentMethod) => {
    return await api.post('/users/subscribe-premium', {
      planId,
      paymentMethod
    });
  },

  // Cancel premium subscription
  cancelPremiumSubscription: async () => {
    return await api.post('/users/cancel-premium');
  },
};