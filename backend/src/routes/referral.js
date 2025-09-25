import express from 'express';
import User from '../models/User.js';
import Referral from '../models/Referral.js';

const router = express.Router();

// Get user's referral information
router.get('/', async (req, res) => {
  try {
    const user = req.user;

    // Get referral statistics
    const referralStats = {
      referralCode: user.referralCode,
      referralCount: user.referralCount,
      hasUnlockedAI: user.hasUnlockedAI,
      referralLink: `${process.env.FRONTEND_URL}/join?ref=${user.referralCode}`
    };

    // Get list of referred users
    const referrals = await Referral.find({ referrer: user._id })
      .populate('referred', 'username displayName avatar createdAt isPhoneVerified isEmailVerified')
      .sort({ createdAt: -1 });

    const referralList = referrals.map(referral => ({
      user: {
        username: referral.referred.username,
        displayName: referral.referred.displayName,
        avatar: referral.referred.avatar,
        joinedAt: referral.referred.createdAt
      },
      status: referral.status,
      completedAt: referral.completedAt,
      rewardGiven: referral.rewardGiven,
      rewardType: referral.rewardType
    }));

    // Calculate progress towards AI unlock
    const progressToAIUnlock = Math.min(user.referralCount / 10, 1) * 100;

    res.status(200).json({
      success: true,
      data: {
        ...referralStats,
        progressToAIUnlock,
        referralsNeededForAI: Math.max(0, 10 - user.referralCount),
        referralList,
        totalReferrals: referrals.length,
        completedReferrals: referrals.filter(r => r.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('Get referral info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral information'
    });
  }
});

// Generate a new referral code (in case user wants to change it)
router.post('/new-code', async (req, res) => {
  try {
    const user = req.user;

    // Generate new unique referral code
    let newCode;
    let isUnique = false;

    while (!isUnique) {
      newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existingUser = await User.findOne({ referralCode: newCode });
      if (!existingUser) {
        isUnique = true;
      }
    }

    user.referralCode = newCode;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'New referral code generated successfully',
      data: {
        referralCode: newCode,
        referralLink: `${process.env.FRONTEND_URL}/join?ref=${newCode}`
      }
    });

  } catch (error) {
    console.error('Generate new referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate new referral code'
    });
  }
});

// Share referral (track sharing analytics)
router.post('/share', async (req, res) => {
  try {
    const { method, platform } = req.body; // method: 'link', 'social', 'message'

    // Track sharing analytics (you can extend this to store in a separate analytics collection)
    console.log(`User ${req.user.username} shared referral via ${method} on ${platform}`);

    // Generate share content
    const shareContent = {
      title: 'Join ChatGenie - AI-Powered Chat App',
      message: `Hey! I'm using ChatGenie, an amazing AI-powered chat app. Join me using my referral code: ${req.user.referralCode}`,
      url: `${process.env.FRONTEND_URL}/join?ref=${req.user.referralCode}`,
      hashtags: ['ChatGenie', 'AIChat', 'Messaging']
    };

    // Social media specific content
    const socialContent = {
      facebook: {
        url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareContent.url)}&quote=${encodeURIComponent(shareContent.message)}`
      },
      twitter: {
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent.message)}&url=${encodeURIComponent(shareContent.url)}&hashtags=${shareContent.hashtags.join(',')}`
      },
      whatsapp: {
        url: `https://wa.me/?text=${encodeURIComponent(shareContent.message + ' ' + shareContent.url)}`
      },
      telegram: {
        url: `https://t.me/share/url?url=${encodeURIComponent(shareContent.url)}&text=${encodeURIComponent(shareContent.message)}`
      }
    };

    res.status(200).json({
      success: true,
      message: 'Share content generated successfully',
      data: {
        content: shareContent,
        socialLinks: socialContent
      }
    });

  } catch (error) {
    console.error('Share referral error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate share content'
    });
  }
});

// Get referral leaderboard (top referrers)
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topReferrers = await User.find({
      referralCount: { $gt: 0 },
      isActive: true
    })
      .select('username displayName avatar referralCount hasUnlockedAI isPremium')
      .sort({ referralCount: -1 })
      .limit(parseInt(limit));

    // Find current user's rank
    const userRank = await User.countDocuments({
      referralCount: { $gt: req.user.referralCount },
      isActive: true
    }) + 1;

    res.status(200).json({
      success: true,
      data: {
        leaderboard: topReferrers.map((user, index) => ({
          rank: index + 1,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          referralCount: user.referralCount,
          hasUnlockedAI: user.hasUnlockedAI,
          isPremium: user.isPremium
        })),
        currentUserRank: userRank,
        currentUserReferrals: req.user.referralCount
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral leaderboard'
    });
  }
});

// Get referral rewards and benefits
router.get('/rewards', async (req, res) => {
  try {
    const rewards = [
      {
        milestone: 1,
        title: 'First Referral',
        description: 'Welcome to the referral program!',
        reward: 'Recognition badge',
        icon: '🎉'
      },
      {
        milestone: 5,
        title: 'Social Butterfly',
        description: 'Referred 5 friends',
        reward: '5 bonus AI replies',
        icon: '🦋'
      },
      {
        milestone: 10,
        title: 'AI Unlocked',
        description: 'Unlimited AI replies forever!',
        reward: 'Unlimited AI features',
        icon: '🤖',
        isMainReward: true
      },
      {
        milestone: 25,
        title: 'Super Referrer',
        description: 'Referred 25 friends',
        reward: '30 days Premium',
        icon: '⭐'
      },
      {
        milestone: 50,
        title: 'ChatGenie Ambassador',
        description: 'Referred 50 friends',
        reward: '90 days Premium + Special badge',
        icon: '👑'
      }
    ];

    // Mark achieved rewards
    const userReferrals = req.user.referralCount;
    const rewardsWithStatus = rewards.map(reward => ({
      ...reward,
      achieved: userReferrals >= reward.milestone,
      progress: Math.min(userReferrals / reward.milestone, 1) * 100
    }));

    res.status(200).json({
      success: true,
      data: {
        rewards: rewardsWithStatus,
        currentReferrals: userReferrals,
        nextMilestone: rewards.find(r => r.milestone > userReferrals)?.milestone || null
      }
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral rewards'
    });
  }
});

// Validate referral code (for registration)
router.get('/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const referrer = await User.findOne({
      referralCode: code,
      isActive: true
    }).select('username displayName avatar referralCount');

    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Valid referral code',
      data: {
        referrer: {
          username: referrer.username,
          displayName: referrer.displayName,
          avatar: referrer.avatar,
          referralCount: referrer.referralCount
        },
        benefits: [
          'Join ChatGenie community',
          'Get started with free AI replies',
          'Help your friend unlock unlimited AI features'
        ]
      }
    });

  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code'
    });
  }
});

// Admin: Get referral analytics
router.get('/analytics', async (req, res) => {
  try {
    // This would typically require admin authentication
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analytics = await Referral.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalStats = {
      totalReferrals: await Referral.countDocuments(),
      completedReferrals: await Referral.countDocuments({ status: 'completed' }),
      activeReferrers: await User.countDocuments({ referralCount: { $gt: 0 } }),
      usersWithUnlockedAI: await User.countDocuments({ hasUnlockedAI: true })
    };

    res.status(200).json({
      success: true,
      data: {
        analytics,
        totalStats,
        conversionRate: totalStats.totalReferrals > 0 ?
          (totalStats.completedReferrals / totalStats.totalReferrals * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    console.error('Get referral analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral analytics'
    });
  }
});

export default router;