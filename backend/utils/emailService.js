import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
const deployed="https://outfit-ai-liart.vercel.app"
const frontendURL=deployed||process.env.FRONTEND_URL;
/**
 * Send a welcome email to a newly registered user
 * @param {string} to - Recipient email address
 * @param {string} username - Username of the new user
 * @returns {Promise} - Promise resolving to the email sending result
 */
export const sendWelcomeEmail = async (to, username) => {
  try {
    console.log('Attempting to send welcome email to:', to);
    console.log('Using email credentials:', process.env.EMAIL_USER);
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Welcome to Outfit AI!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(135deg, #6e8efb, #a777e3); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Outfit AI</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none;">
            <h2>Hello ${username},</h2>
            <p>Thank you for joining Outfit AI! We're excited to have you as part of our community.</p>
            <p>With Outfit AI, you can:</p>
            <ul>
              <li>Get AI-powered outfit recommendations</li>
              <li>Organize your virtual wardrobe</li>
              <li>Shop for new clothes with personalized suggestions</li>
              <li>Connect with other fashion enthusiasts</li>
            </ul>
            
            <div style="background-color: #f0f7ff; border-left: 4px solid #6e8efb; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <h4 style="margin: 0 0 10px; color: #333;">Login Information</h4>
              <p>If you login using google then your password is <b>google</b></p>
              <p>If you login using facebook then your password is <b>facebook</b></p>
            </div>
            
            <p>If you have any questions or need assistance, feel free to contact our support team.</p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${frontendURL}" style="background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Exploring</a>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              This email was sent to you because you registered for an account on Outfit AI.<br>
              Created by Aditya Kurani<br>
              © ${new Date().getFullYear()} Outfit AI. All rights reserved.
            </p>
            
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    console.error('Email configuration:', {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS ? '***Password exists***' : '***Password missing***'
    });
    // Don't throw the error to prevent registration from failing if email fails
    return null;
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Password reset link
 * @returns {Promise} - Promise resolving to the email sending result
 */
export const sendPasswordResetEmail = async (to, resetLink) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Password Reset - Outfit AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(135deg, #6e8efb, #a777e3); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none;">
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="margin: 30px 0; text-align: center;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #6e8efb, #a777e3); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
            <p style="margin-top: 30px; font-size: 12px; color: #666; text-align: center;">
              © ${new Date().getFullYear()} Outfit AI. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};
