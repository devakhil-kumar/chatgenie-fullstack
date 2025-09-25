import express from 'express';
import User from '../models/User.js';
import { validate, updateProfileSchema } from '../utils/validators.js';

const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -phoneOTP -emailOTP')
      .populate('referredBy', 'username displayName');

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', validate(updateProfileSchema), async (req, res) => {
  try {
    const { displayName, bio, avatar } = req.validatedData;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { displayName, bio, avatar },
      { new: true, runValidators: true }
    ).select('-password -phoneOTP -emailOTP');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Search users
router.get('/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { displayName: searchRegex },
        { email: searchRegex }
      ],
      _id: { $ne: req.user._id },
      isActive: true
    })
      .select('username displayName avatar isOnline lastSeen')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// Get user by username
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username, isActive: true })
      .select('username displayName avatar bio isOnline lastSeen isPremium');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
});

export default router;