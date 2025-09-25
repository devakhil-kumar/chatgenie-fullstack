import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // User who made the payment
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Payment details
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },

  // Payment method and gateway
  paymentMethod: {
    type: String,
    enum: ['stripe', 'razorpay', 'upi', 'card', 'wallet'],
    required: true
  },

  // External payment IDs
  stripePaymentIntentId: { type: String },
  razorpayPaymentId: { type: String },
  razorpayOrderId: { type: String },

  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },

  // What the payment is for
  type: {
    type: String,
    enum: ['premium_subscription', 'ai_credits', 'premium_features'],
    required: true
  },

  // Subscription details
  subscription: {
    plan: {
      type: String,
      enum: ['monthly', 'yearly', 'lifetime'],
    },
    startDate: { type: Date },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: true }
  },

  // Credits purchased
  credits: {
    amount: { type: Number }, // Number of AI reply credits
    validUntil: { type: Date }
  },

  // Payment metadata
  metadata: {
    ip: { type: String },
    userAgent: { type: String },
    source: { type: String }, // 'app', 'web'
  },

  // Transaction details
  transactionId: { type: String, unique: true },
  receiptUrl: { type: String },
  invoice: {
    number: { type: String },
    url: { type: String }
  },

  // Refund information
  refund: {
    amount: { type: Number },
    reason: { type: String },
    refundedAt: { type: Date },
    refundId: { type: String }
  },

  // Processing timestamps
  processedAt: { type: Date },
  completedAt: { type: Date },
  failedAt: { type: Date },
  cancelledAt: { type: Date },

  // Error information
  error: {
    code: { type: String },
    message: { type: String },
    details: { type: mongoose.Schema.Types.Mixed }
  }

}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ stripePaymentIntentId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ createdAt: -1 });

// Generate unique transaction ID
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    this.transactionId = `CGP_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
  next();
});

// Mark payment as completed
paymentSchema.methods.markCompleted = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.processedAt = this.processedAt || new Date();

  // Apply the benefits to user
  const User = mongoose.model('User');
  const user = await User.findById(this.user);

  if (user) {
    switch (this.type) {
      case 'premium_subscription':
        user.isPremium = true;
        if (this.subscription.endDate) {
          user.premiumExpiresAt = this.subscription.endDate;
        }
        break;

      case 'ai_credits':
        if (this.credits.amount) {
          user.aiRepliesLimit += this.credits.amount;
        }
        break;

      case 'premium_features':
        user.hasUnlockedAI = true;
        break;
    }

    await user.save();
  }

  await this.save();
};

// Mark payment as failed
paymentSchema.methods.markFailed = async function(errorCode, errorMessage, errorDetails = null) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.error = {
    code: errorCode,
    message: errorMessage,
    details: errorDetails
  };

  await this.save();
};

// Process refund
paymentSchema.methods.processRefund = async function(refundAmount, reason) {
  if (this.status !== 'completed') {
    throw new Error('Can only refund completed payments');
  }

  this.status = 'refunded';
  this.refund = {
    amount: refundAmount || this.amount,
    reason: reason,
    refundedAt: new Date(),
    refundId: `REF_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`
  };

  // Revert user benefits
  const User = mongoose.model('User');
  const user = await User.findById(this.user);

  if (user) {
    switch (this.type) {
      case 'premium_subscription':
        if (!user.hasUnlockedAI) { // Don't remove if unlocked via referrals
          user.isPremium = false;
          user.premiumExpiresAt = null;
        }
        break;

      case 'ai_credits':
        if (this.credits.amount) {
          user.aiRepliesLimit = Math.max(0, user.aiRepliesLimit - this.credits.amount);
        }
        break;

      case 'premium_features':
        if (!user.hasUnlockedAI) {
          user.hasUnlockedAI = false;
        }
        break;
    }

    await user.save();
  }

  await this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;