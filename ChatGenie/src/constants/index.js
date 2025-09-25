export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',

  secondary: '#f3f4f6',
  secondaryDark: '#e5e7eb',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  text: {
    primary: '#111827',
    secondary: '#6b7280',
    muted: '#9ca3af',
    inverse: '#fff',
  },

  background: {
    primary: '#fff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
  },

  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
};

export const SIZES = {
  // Padding & Margins
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Font sizes
  caption: 12,
  body: 14,
  title: 16,
  h3: 18,
  h2: 20,
  h1: 24,

  // Border radius
  radiusXS: 4,
  radiusSM: 6,
  radiusMD: 8,
  radiusLG: 12,
  radiusXL: 16,

  // Button heights
  buttonSmall: 36,
  buttonMedium: 44,
  buttonLarge: 52,

  // Icon sizes
  iconXS: 16,
  iconSM: 20,
  iconMD: 24,
  iconLG: 28,
  iconXL: 32,
};

export const AI_TONES = [
  {
    id: 'funny',
    name: 'Funny',
    emoji: '😂',
    description: 'Add humor and wit to your messages',
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💕',
    description: 'Express love and affection beautifully',
  },
  {
    id: 'formal',
    name: 'Formal',
    emoji: '🎩',
    description: 'Professional and polite communication',
  },
  {
    id: 'casual',
    name: 'Casual',
    emoji: '😊',
    description: 'Relaxed and friendly conversations',
  },
  {
    id: 'flirty',
    name: 'Flirty',
    emoji: '😉',
    description: 'Playful and charming messages',
  },
];

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AI_SUGGESTION: 'ai_suggestion',
  SYSTEM: 'system',
};

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
};

export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Premium',
    price: 9.99,
    duration: 'month',
    features: [
      'Unlimited AI replies',
      'All AI tones',
      'Priority support',
      'No ads',
      'Advanced suggestions',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Premium',
    price: 99.99,
    duration: 'year',
    features: [
      'Unlimited AI replies',
      'All AI tones',
      'Priority support',
      'No ads',
      'Advanced suggestions',
      'Save 17%',
    ],
    popular: true,
  },
];

export const CREDIT_PACKAGES = [
  {
    id: 'small',
    name: '50 Credits',
    credits: 50,
    price: 4.99,
    popular: false,
  },
  {
    id: 'medium',
    name: '120 Credits',
    credits: 120,
    price: 9.99,
    popular: true,
    bonus: 20,
  },
  {
    id: 'large',
    name: '250 Credits',
    credits: 250,
    price: 19.99,
    popular: false,
    bonus: 50,
  },
];

export const API_ENDPOINTS = {
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  CHAT: {
    GET_CHATS: '/chats',
    GET_MESSAGES: '/chats/:chatId/messages',
    SEND_MESSAGE: '/chats/:chatId/messages',
    UPLOAD_MEDIA: '/chats/:chatId/upload',
  },
  AI: {
    GET_SUGGESTIONS: '/ai/suggestions',
    GENERATE_REPLY: '/ai/generate-reply',
  },
  USER: {
    PROFILE: '/users/profile',
    CONTACTS: '/users/contacts',
    REFERRAL_STATS: '/users/referral-stats',
  },
};