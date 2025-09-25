import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  // The user who made the referral
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // The user who was referred
  referred: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Referral tracking
  referralCode: {
    type: String,
    required: true
  },

  // Conversion tracking
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },

  // When the referred user completed the requirement (e.g., verified phone)
  completedAt: { type: Date },

  // Rewards given
  rewardGiven: { type: Boolean, default: false },
  rewardType: {
    type: String,
    enum: ['ai_unlock', 'premium_days', 'credits'],
    default: 'ai_unlock'
  },
  rewardValue: { type: Number }, // Days for premium, credits amount, etc.

  // Tracking metadata
  metadata: {
    source: { type: String }, // 'link', 'app_share', 'social_media'
    ip: { type: String },
    userAgent: { type: String },
    referrerUrl: { type: String }
  },

  // Campaign tracking
  campaign: { type: String }, // For A/B testing different referral campaigns

}, {
  timestamps: true
});

// Indexes
referralSchema.index({ referrer: 1 });
referralSchema.index({ referred: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1 });
referralSchema.index({ completedAt: 1 });

// Ensure one referral per referred user
referralSchema.index({ referred: 1 }, { unique: true });

// Complete the referral
referralSchema.methods.complete = async function() {
  if (this.status === 'completed') return;

  this.status = 'completed';
  this.completedAt = new Date();

  // Update referrer's count
  const User = mongoose.model('User');
  const referrer = await User.findById(this.referrer);
  if (referrer) {
    await referrer.addReferral();
  }

  await this.save();
};

// Give reward to referrer
referralSchema.methods.giveReward = async function() {
  if (this.rewardGiven) return;

  const User = mongoose.model('User');
  const referrer = await User.findById(this.referrer);

  if (referrer && this.status === 'completed') {
    switch (this.rewardType) {
      case 'ai_unlock':
        // Already handled in User.addReferral()
        break;
      case 'premium_days':
        const premiumDays = this.rewardValue || 7;
        const currentExpiry = referrer.premiumExpiresAt || new Date();
        const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + premiumDays * 24 * 60 * 60 * 1000);
        referrer.premiumExpiresAt = newExpiry;
        referrer.isPremium = true;
        await referrer.save();
        break;
      case 'credits':
        // Implement credit system if needed
        break;
    }

    this.rewardGiven = true;
    await this.save();
  }
};

const Referral = mongoose.model('Referral', referralSchema);

export default Referral;