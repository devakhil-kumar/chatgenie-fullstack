import twilio from 'twilio';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Initialize Twilio client
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Initialize email transporter
// const emailTransporter = nodemailer.createTransporter({
//   service: process.env.EMAIL_SERVICE || 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD
//   }
// });

export class OTPService {
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async sendPhoneOTP(phoneNumber, otp) {
    try {
      // Development mode - just log the OTP
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.log(`📱 OTP for ${phoneNumber}: ${otp} (Twilio not configured)`);
        return { success: true, message: 'OTP sent (development mode)' };
      }

      // Production mode - actually send SMS
      const message = await twilioClient.messages.create({
        body: `Your ChatGenie verification code is: ${otp}. This code will expire in 10 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log(`📱 SMS sent to ${phoneNumber}, SID: ${message.sid}`);
      return {
        success: true,
        message: 'OTP sent successfully',
        messageSid: message.sid
      };
    } catch (error) {
      console.error('Error sending SMS OTP:', error);
      throw new Error('Failed to send SMS OTP');
    }
  }

  static async sendEmailOTP(email, otp) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(`📧 OTP for ${email}: ${otp} (Email service not configured)`);
        return { success: true, message: 'OTP sent (development mode)' };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'ChatGenie - Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">ChatGenie Verification</h2>
            <p>Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="font-size: 32px; color: #1f2937; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The ChatGenie Team
            </p>
          </div>
        `
      };

      // const info = await emailTransporter.sendMail(mailOptions);
      // console.log(`📧 Email sent to ${email}, MessageID: ${info.messageId}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        messageId: 'dev_mode'
      };
    } catch (error) {
      console.error('Error sending email OTP:', error);
      throw new Error('Failed to send email OTP');
    }
  }

  static async sendWelcomeEmail(email, displayName) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log(`📧 Welcome email for ${email} (Email service not configured)`);
        return { success: true, message: 'Welcome email sent (development mode)' };
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Welcome to ChatGenie! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">Welcome to ChatGenie! 🎉</h1>
            <p>Hi ${displayName},</p>
            <p>Welcome to ChatGenie, the AI-powered chat app that makes conversations more engaging and fun!</p>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">🚀 Getting Started</h3>
              <ul style="color: #4b5563;">
                <li>Start chatting with friends and create group conversations</li>
                <li>Invite 10 friends to unlock unlimited AI replies</li>
                <li>Try our AI suggestions for more engaging responses</li>
                <li>Upgrade to Premium for advanced AI features</li>
              </ul>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #059669; margin-top: 0;">🤖 AI Features</h3>
              <p style="color: #065f46;">Our AI can help you craft replies with different tones:</p>
              <ul style="color: #065f46;">
                <li><strong>Funny:</strong> Add humor to your conversations</li>
                <li><strong>Romantic:</strong> Express your feelings beautifully</li>
                <li><strong>Professional:</strong> Keep it formal for work chats</li>
                <li><strong>Casual:</strong> Friendly and relaxed responses</li>
              </ul>
            </div>

            <p>Happy chatting!</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              The ChatGenie Team
            </p>
          </div>
        `
      };

      // const info = await emailTransporter.sendMail(mailOptions);
      // console.log(`📧 Welcome email sent to ${email}, MessageID: ${info.messageId}`);

      return {
        success: true,
        message: 'Welcome email sent successfully',
        messageId: 'dev_mode'
      };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email, it's not critical
      return { success: false, message: 'Failed to send welcome email' };
    }
  }

  static verifyOTP(storedOTP, providedOTP, expiresAt) {
    if (!storedOTP || !expiresAt) {
      return { valid: false, message: 'No OTP found or OTP expired' };
    }

    if (new Date() > expiresAt) {
      return { valid: false, message: 'OTP has expired' };
    }

    if (storedOTP !== providedOTP) {
      return { valid: false, message: 'Invalid OTP' };
    }

    return { valid: true, message: 'OTP verified successfully' };
  }
}