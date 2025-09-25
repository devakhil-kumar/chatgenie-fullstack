import express from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import Referral from '../models/Referral.js';
import { OTPService } from '../services/otpService.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema, otpSchema, resetPasswordSchema } from '../utils/validators.js';

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 OTP requests per minute
  message: { success: false, message: 'Too many OTP requests, please try again later.' }
});

// Register new user
router.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { username, displayName, phoneNumber, email, password, referralCode } = req.validatedData;

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already taken'
      });
    }

    // Check if phone or email already exists
    if (phoneNumber) {
      const phoneExists = await User.findOne({ phoneNumber });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already registered'
        });
      }
    }

    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
    }

    // Handle referral
    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: 'Invalid referral code'
        });
      }
    }

    // Create new user
    const userData = {
      username,
      displayName,
      phoneNumber,
      email,
      password,
      referredBy: referrer?._id
    };

    const user = new User(userData);
    await user.save();

    // Create referral record if referred
    if (referrer) {
      const referral = new Referral({
        referrer: referrer._id,
        referred: user._id,
        referralCode: referralCode,
        metadata: {
          source: 'registration',
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
      await referral.save();
    }

    // Send OTP for verification
    let otpSent = false;
    const otp = OTPService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (phoneNumber) {
      await OTPService.sendPhoneOTP(phoneNumber, otp);
      user.phoneOTP = otp;
      user.otpExpires = otpExpires;
      otpSent = true;
    } else if (email) {
      await OTPService.sendEmailOTP(email, otp);
      user.emailOTP = otp;
      user.otpExpires = otpExpires;
      otpSent = true;
    }

    await user.save();

    // Send welcome email if email provided
    if (email) {
      OTPService.sendWelcomeEmail(email, displayName);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: user._id,
        username: user.username,
        displayName: user.displayName,
        otpSent,
        requiresVerification: otpSent
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login user
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { identifier, password, loginType } = req.validatedData;

    let query = {};
    if (loginType === 'phone') {
      query = { phoneNumber: identifier };
    } else if (loginType === 'email') {
      query = { email: identifier };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid login type'
      });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended'
      });
    }

    // For OTP login, send OTP
    if (loginType === 'otp' || !password) {
      const otp = OTPService.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

      if (user.phoneNumber && loginType === 'phone') {
        await OTPService.sendPhoneOTP(user.phoneNumber, otp);
        user.phoneOTP = otp;
      } else if (user.email && loginType === 'email') {
        await OTPService.sendEmailOTP(user.email, otp);
        user.emailOTP = otp;
      } else {
        return res.status(400).json({
          success: false,
          message: 'No phone number or email associated with this account'
        });
      }

      user.otpExpires = otpExpires;
      await user.save();

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: { requiresOTP: true }
      });
    }

    // Password login
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Check if verification is required
    const needsVerification = (user.phoneNumber && !user.isPhoneVerified) ||
                              (user.email && !user.isEmailVerified);

    if (needsVerification) {
      return res.status(200).json({
        success: true,
        message: 'Login successful, but verification required',
        data: {
          userId: user._id,
          requiresVerification: true
        }
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.profile,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify OTP
router.post('/verify-otp', authLimiter, validate(otpSchema), async (req, res) => {
  try {
    const { identifier, otp, type } = req.validatedData;

    let query = {};
    if (type === 'phone') {
      query = { phoneNumber: identifier };
    } else if (type === 'email') {
      query = { email: identifier };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    user.clearExpiredOTP();

    const storedOTP = type === 'phone' ? user.phoneOTP : user.emailOTP;
    const verification = OTPService.verifyOTP(storedOTP, otp, user.otpExpires);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Mark as verified
    if (type === 'phone') {
      user.isPhoneVerified = true;
      user.phoneOTP = undefined;
    } else {
      user.isEmailVerified = true;
      user.emailOTP = undefined;
    }

    user.otpExpires = undefined;
    await user.save();

    // Complete referral if this is first verification
    if (user.referredBy && !user.isPhoneVerified && !user.isEmailVerified) {
      const referral = await Referral.findOne({ referred: user._id });
      if (referral && referral.status === 'pending') {
        await referral.complete();
        await referral.giveReward();
      }
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: user.profile,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resend OTP
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and type are required'
      });
    }

    let query = {};
    if (type === 'phone') {
      query = { phoneNumber: identifier };
    } else if (type === 'email') {
      query = { email: identifier };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type'
      });
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    const otp = OTPService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === 'phone') {
      await OTPService.sendPhoneOTP(user.phoneNumber, otp);
      user.phoneOTP = otp;
    } else {
      await OTPService.sendEmailOTP(user.email, otp);
      user.emailOTP = otp;
    }

    user.otpExpires = otpExpires;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reset password
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), async (req, res) => {
  try {
    const { identifier, otp, newPassword, type } = req.validatedData;

    let query = {};
    if (type === 'phone') {
      query = { phoneNumber: identifier };
    } else if (type === 'email') {
      query = { email: identifier };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    user.clearExpiredOTP();

    const storedOTP = type === 'phone' ? user.phoneOTP : user.emailOTP;
    const verification = OTPService.verifyOTP(storedOTP, otp, user.otpExpires);

    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Update password
    user.password = newPassword;
    user.phoneOTP = undefined;
    user.emailOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Request password reset
router.post('/forgot-password', otpLimiter, async (req, res) => {
  try {
    const { identifier, type } = req.body;

    if (!identifier || !type) {
      return res.status(400).json({
        success: false,
        message: 'Identifier and type are required'
      });
    }

    let query = {};
    if (type === 'phone') {
      query = { phoneNumber: identifier };
    } else if (type === 'email') {
      query = { email: identifier };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid type'
      });
    }

    const user = await User.findOne(query);
    if (!user) {
      // Don't reveal if user exists for security
      return res.status(200).json({
        success: true,
        message: 'If the account exists, a reset code has been sent'
      });
    }

    const otp = OTPService.generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (type === 'phone') {
      await OTPService.sendPhoneOTP(user.phoneNumber, otp);
      user.phoneOTP = otp;
    } else {
      await OTPService.sendEmailOTP(user.email, otp);
      user.emailOTP = otp;
    }

    user.otpExpires = otpExpires;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Reset code sent successfully'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;