import nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { log } from '../utils/logger';

// Default config for development (ethereal email)
const DEFAULT_CONFIG = {
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'ethereal.user@ethereal.email',
    pass: 'ethereal_password'
  }
};

// Read from environment variables for actual deployment
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  from: process.env.EMAIL_FROM || 'GoatedVIPs <noreply@goatedvips.com>'
};

// Application base URL for email links
const APP_URL = process.env.APP_URL || 'https://goatedvips.com';

/**
 * Create a transporter for sending emails
 * 
 * @returns Nodemailer transporter
 */
function createTransporter() {
  // If we have email configuration in env vars, use that
  if (EMAIL_CONFIG.host && EMAIL_CONFIG.auth.user) {
    return nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      }
    });
  }

  // For development, create a test account
  log('Using ethereal email for development', 'email', 'info');
  return nodemailer.createTransport(DEFAULT_CONFIG);
}

/**
 * Send an email
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 * @param text - Plain text content of the email
 * @returns Promise that resolves with the send info
 */
export async function sendEmail(to: string, subject: string, html: string, text: string) {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      text,
      html
    });

    log(`Email sent: ${info.messageId}`, 'email', 'info');
    
    // Log testURL for development environments
    if (!EMAIL_CONFIG.host && info.messageId) {
      log(`Email sent with message ID: ${info.messageId}`, 'email', 'info');
    }
    
    return info;
  } catch (error) {
    log('Error sending email: ' + (error instanceof Error ? error.message : String(error)), 'email', 'error');
    throw error;
  }
}

/**
 * Send a verification email
 * 
 * @param to - Recipient email address
 * @param username - Username of the recipient
 * @param token - Verification token
 * @returns Promise that resolves with the send info
 */
export async function sendVerificationEmail(to: string, username: string, token: string) {
  const verificationLink = `${APP_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${APP_URL}/logo.svg" alt="GoatedVIPs Logo" style="max-width: 150px;" />
      </div>
      <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
      <p style="color: #666; line-height: 1.5;">Hello ${username},</p>
      <p style="color: #666; line-height: 1.5;">Thank you for signing up with GoatedVIPs! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #FDE047; color: #1f2937; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
      </div>
      <p style="color: #666; line-height: 1.5;">Or copy and paste this link into your browser:</p>
      <p style="color: #666; line-height: 1.5; word-break: break-all;"><a href="${verificationLink}" style="color: #3182ce;">${verificationLink}</a></p>
      <p style="color: #666; line-height: 1.5;">This link will expire in 24 hours.</p>
      <p style="color: #666; line-height: 1.5;">If you did not sign up for a GoatedVIPs account, you can safely ignore this email.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #999; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} GoatedVIPs. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  const text = `
    Hello ${username},
    
    Thank you for signing up with GoatedVIPs! Please verify your email address by visiting the link below:
    
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you did not sign up for a GoatedVIPs account, you can safely ignore this email.
    
    © ${new Date().getFullYear()} GoatedVIPs. All rights reserved.
    This is an automated message, please do not reply to this email.
  `;
  
  return sendEmail(to, 'Verify Your Email Address - GoatedVIPs', html, text);
}

/**
 * Send a password reset email
 * 
 * @param to - Recipient email address
 * @param username - Username of the recipient
 * @param token - Password reset token
 * @returns Promise that resolves with the send info
 */
export async function sendPasswordResetEmail(to: string, username: string, token: string) {
  const resetLink = `${APP_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${APP_URL}/logo.svg" alt="GoatedVIPs Logo" style="max-width: 150px;" />
      </div>
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="color: #666; line-height: 1.5;">Hello ${username},</p>
      <p style="color: #666; line-height: 1.5;">We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #FDE047; color: #1f2937; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #666; line-height: 1.5;">Or copy and paste this link into your browser:</p>
      <p style="color: #666; line-height: 1.5; word-break: break-all;"><a href="${resetLink}" style="color: #3182ce;">${resetLink}</a></p>
      <p style="color: #666; line-height: 1.5;">This link will expire in 1 hour.</p>
      <p style="color: #666; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #999; font-size: 12px;">
        <p>&copy; ${new Date().getFullYear()} GoatedVIPs. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
  
  const text = `
    Hello ${username},
    
    We received a request to reset your password. Visit the link below to create a new password:
    
    ${resetLink}
    
    This link will expire in 1 hour.
    
    If you did not request a password reset, you can safely ignore this email.
    
    © ${new Date().getFullYear()} GoatedVIPs. All rights reserved.
    This is an automated message, please do not reply to this email.
  `;
  
  return sendEmail(to, 'Reset Your Password - GoatedVIPs', html, text);
}