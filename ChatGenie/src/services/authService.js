import api from './api';

export const authAPI = {
  // Send OTP to phone number
  sendOTP: async (phone) => {
    return await api.post('/auth/send-otp', { phone });
  },

  // Verify OTP and login
  verifyOTP: async (phone, otp) => {
    return await api.post('/auth/verify-otp', { phone, otp });
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    return await api.post('/auth/refresh', { refreshToken });
  },

  // Logout user
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Check if phone number is registered
  checkPhone: async (phone) => {
    return await api.post('/auth/check-phone', { phone });
  },

  // Register new user
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  // Forgot password
  forgotPassword: async (phone) => {
    return await api.post('/auth/forgot-password', { phone });
  },

  // Reset password
  resetPassword: async (phone, otp, newPassword) => {
    return await api.post('/auth/reset-password', { phone, otp, newPassword });
  },

  // Social login (Google, Facebook, Apple)
  socialLogin: async (provider, token) => {
    return await api.post('/auth/social-login', { provider, token });
  },
};