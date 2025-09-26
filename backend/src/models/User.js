import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Authentication fields
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    validate: {
      validator: function(v) {
        return !v || /^\+\d{10,15}$/.test(v);
      },
      message: 'Phone number must include country code and be 10-15 digits'
    }
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: false, // Optional for OAuth users
    minlength: 6
  },

  // OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  appleId: { type: String, unique: true, sparse: true },

  // Profile fields
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: 200,
    default: ''
  },

  // Verification fields
  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  phoneOTP: { type: String },
  emailOTP: { type: String },
  otpExpires: { type: Date },

  // Premium features
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date },
  aiRepliesUsed: { type: Number, default: 0 },
  aiRepliesLimit: { type: Number, default: 10 }, // Free tier limit

  // Referral system
  referralCode: {
    type: String,
    unique: true,
    required: false // Auto-generated in pre-save hook
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCount: { type: Number, default: 0 },
  hasUnlockedAI: { type: Boolean, default: false }, // Unlocked after 10 referrals

  // Status fields
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },

  // Device tokens for push notifications
  deviceTokens: [{ type: String }],

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ phoneNumber: 1 });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ appleId: 1 });

// Virtual for full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    bio: this.bio,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    isPremium: this.isPremium
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user can use AI features
userSchema.methods.canUseAI = function() {
  return this.isPremium || this.hasUnlockedAI || this.aiRepliesUsed < this.aiRepliesLimit;
};

// Increment AI usage
userSchema.methods.useAIReply = async function() {
  if (!this.canUseAI()) {
    throw new Error('AI reply limit exceeded');
  }

  this.aiRepliesUsed += 1;
  await this.save();
};

// Update referral count
userSchema.methods.addReferral = async function() {
  this.referralCount += 1;

  // Unlock AI features after 10 referrals
  if (this.referralCount >= 10) {
    this.hasUnlockedAI = true;
  }

  await this.save();
};

// Clean expired OTPs
userSchema.methods.clearExpiredOTP = function() {
  if (this.otpExpires && this.otpExpires < new Date()) {
    this.phoneOTP = undefined;
    this.emailOTP = undefined;
    this.otpExpires = undefined;
  }
};

const User = mongoose.model('User', userSchema);

export default User;