import Joi from 'joi';

// Auth validation schemas
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  displayName: Joi.string().min(1).max(50).required(),
  phoneNumber: Joi.string().pattern(/^\+\d{10,15}$/).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).when('phoneNumber', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  // referralCode: Joi.string().length(6).uppercase().optional().allow('', null)
}).or('phoneNumber', 'email');

export const loginSchema = Joi.object({
  identifier: Joi.string().required(), // phone or email  
  password: Joi.string().min(6).optional(),
  loginType: Joi.string().valid('phone', 'email', 'otp').required()
});

export const otpSchema = Joi.object({
  identifier: Joi.string().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  type: Joi.string().valid('phone', 'email').required()
});

export const resetPasswordSchema = Joi.object({
  identifier: Joi.string().required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  newPassword: Joi.string().min(6).required(),
  type: Joi.string().valid('phone', 'email').required()
});

// Message validation schemas
export const sendMessageSchema = Joi.object({
  chatId: Joi.string().hex().length(24).required(),
  content: Joi.object({
    text: Joi.string().max(4000).optional(),
    type: Joi.string().valid('text', 'image', 'video', 'audio', 'file', 'location', 'contact').default('text')
  }).required(),
  replyTo: Joi.string().hex().length(24).optional(),
  aiTone: Joi.string().valid('neutral', 'funny', 'romantic', 'formal', 'casual', 'professional').optional()
});

export const editMessageSchema = Joi.object({
  messageId: Joi.string().hex().length(24).required(),
  content: Joi.string().max(4000).required()
});

// Chat validation schemas
export const createChatSchema = Joi.object({
  type: Joi.string().valid('direct', 'group').required(),
  participants: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  name: Joi.string().max(100).when('type', {
    is: 'group',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  description: Joi.string().max(500).optional()
});

export const updateChatSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  description: Joi.string().max(500).optional(),
  settings: Joi.object({
    muteNotifications: Joi.boolean().optional(),
    allowAIReplies: Joi.boolean().optional(),
    autoDeleteMessages: Joi.number().min(0).optional()
  }).optional()
});

export const addParticipantSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  role: Joi.string().valid('member', 'admin').default('member')
});

// AI validation schemas
export const aiReplySchema = Joi.object({
  messageId: Joi.string().hex().length(24).required(),
  tone: Joi.string().valid('neutral', 'funny', 'romantic', 'formal', 'casual', 'professional').default('neutral'),
  customPrompt: Joi.string().max(200).optional()
});

// Payment validation schemas
export const createPaymentSchema = Joi.object({
  type: Joi.string().valid('premium_subscription', 'ai_credits', 'premium_features').required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  paymentMethod: Joi.string().valid('stripe', 'razorpay', 'upi').required(),
  subscription: Joi.object({
    plan: Joi.string().valid('monthly', 'yearly', 'lifetime').required(),
    autoRenew: Joi.boolean().default(true)
  }).when('type', {
    is: 'premium_subscription',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  credits: Joi.object({
    amount: Joi.number().positive().required()
  }).when('type', {
    is: 'ai_credits',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// User profile validation schemas
export const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(1).max(50).optional(),
  bio: Joi.string().max(200).optional(),
  avatar: Joi.string().uri().optional()
});

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = {};
      error.details.forEach(detail => {
        errors[detail.path[0]] = detail.message;
      });

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};