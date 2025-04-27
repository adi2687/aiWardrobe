import express from 'express';
import User from '../model/user.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Store reset tokens (in a production app, these should be in a database)
const passwordResetTokens = {};

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    
    // Generate token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Store token with expiration (2 hours)
    passwordResetTokens[token] = {
      email: user.email,
      userId: user._id,
      expiration: Date.now() + 7200000 // 2 hours in milliseconds
    };
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Outfit AI - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6a11cb;">Reset Your Password</h2>
          <p>Hello ${user.username},</p>
          <p>We received a request to reset your password for your Outfit AI account.</p>
          <p>Click the button below to reset your password. This link is valid for 2 hours.</p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>The Outfit AI Team</p>
        </div>
      `
    };
    
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Error sending reset email' });
      }
      
      res.status(200).json({ message: 'Password reset link sent to your email' });
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    
    // Check if token exists and is valid
    const resetData = passwordResetTokens[token];
    if (!resetData) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    
    // Check if token is expired
    if (Date.now() > resetData.expiration) {
      delete passwordResetTokens[token]; // Clean up expired token
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    
    // Update user's password
    const user = await User.findById(resetData.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.password = newPassword;
    await user.save();
    
    // Remove used token
    delete passwordResetTokens[token];
    
    res.status(200).json({ message: 'Password has been reset successfully' });
    
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
