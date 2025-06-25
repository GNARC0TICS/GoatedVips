import { IEmailService, EmailOptions, EmailTemplate } from './IEmailService';
import { getLogger } from '../logging/Logger';

/**
 * Mock email service for development and testing
 * In production, replace with real email service (SendGrid, AWS SES, etc.)
 */
export class MockEmailService implements IEmailService {
  private logger = getLogger();
  
  async sendEmail(options: EmailOptions): Promise<boolean> {
    this.logger.info('Mock email sent', {
      to: options.to,
      subject: options.subject,
      hasHtml: !!options.html,
      hasText: !!options.text,
      attachments: options.attachments?.length || 0,
    });
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  }
  
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Verify your GoatedVIPs account',
      html: `
        <h1>Welcome to GoatedVIPs!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
      text: `
        Welcome to GoatedVIPs!
        
        Please visit the following link to verify your email address:
        ${verificationUrl}
        
        If you didn't create an account, please ignore this email.
      `,
    });
  }
  
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset your GoatedVIPs password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset for your GoatedVIPs account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
      `,
      text: `
        Password Reset Request
        
        You requested a password reset for your GoatedVIPs account.
        
        Visit the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        
        If you didn't request this reset, please ignore this email.
      `,
    });
  }
  
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to GoatedVIPs!',
      html: `
        <h1>Welcome to GoatedVIPs, ${username}!</h1>
        <p>Your account has been successfully created.</p>
        <p>You can now:</p>
        <ul>
          <li>Track your wager statistics</li>
          <li>Participate in wager races</li>
          <li>Compete on leaderboards</li>
          <li>Link your Goated.com account</li>
        </ul>
        <p>Get started by visiting your dashboard!</p>
      `,
      text: `
        Welcome to GoatedVIPs, ${username}!
        
        Your account has been successfully created.
        
        You can now:
        - Track your wager statistics
        - Participate in wager races
        - Compete on leaderboards
        - Link your Goated.com account
        
        Get started by visiting your dashboard!
      `,
    });
  }
}