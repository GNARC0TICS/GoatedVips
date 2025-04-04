import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type SelectUser } from "@db/schema";
import { db } from "@db";
import { eq, and } from "drizzle-orm";
import express from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const scryptAsync = promisify(scrypt);

// Enhanced rate limiters for various authentication endpoints
const authLimiter = new RateLimiterMemory({
  points: 20, // 20 attempts
  duration: 60 * 5, // per 5 minutes
  blockDuration: 60 * 2, // Block for 2 minutes
});

// Stricter rate limiter for sensitive operations like password reset and email change
const sensitiveOpLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 10, // per 10 minutes
  blockDuration: 60 * 15, // Block for 15 minutes
});

// Rate limiter specifically for token refresh to prevent abuse
const tokenRefreshLimiter = new RateLimiterMemory({
  points: 30, // 30 attempts
  duration: 60 * 15, // per 15 minutes
  blockDuration: 60 * 5, // Block for 5 minutes
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// Account lockout tracking
interface LockoutEntry {
  failedAttempts: number;
  lockedUntil: Date | null;
}
const accountLockouts = new Map<string, LockoutEntry>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

// JWT token types
interface JwtPayload {
  id: number;
  username: string;
  isAdmin: boolean;
  email: string;
  tokenVersion?: number;
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      jwtUser?: JwtPayload;
    }
  }
}

export function setupAuth(app: Express) {
  app.use(passport.initialize());
  app.use(passport.session());

  // Session serialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Local strategy setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // For admin login
        if (username === process.env.ADMIN_USERNAME) {
          if (password === process.env.ADMIN_PASSWORD) {
            return done(null, {
              id: 1,
              username: process.env.ADMIN_USERNAME,
              isAdmin: true,
              email: `${process.env.ADMIN_USERNAME}@admin.local`
            });
          } else {
            return done(null, false, { message: "Invalid admin password" });
          }
        }

        if (!username || !password) {
          return done(null, false, { message: "Username and password are required" });
        }

        // Sanitize credentials for non-admin users
        const sanitizedUsername = username.trim().toLowerCase();
        const sanitizedPassword = password.trim();

        if (!sanitizedUsername || !sanitizedPassword) {
          return done(null, false, { message: "Username and password cannot be empty" });
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, sanitizedUsername))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isMatch = await comparePasswords(sanitizedPassword, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.issues.map((i) => i.message).join(", ");
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors,
        });
      }

      // Rate limiting check
      try {
        await authLimiter.consume(req.ip || 'unknown');
      } catch (error) {
        return res.status(429).json({
          status: "error",
          message: "Too many attempts. Please try again later.",
        });
      }

      const { username, password, email } = result.data;
      const sanitizedUsername = username.trim().toLowerCase();

      // Check for existing username
      const [existingUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, sanitizedUsername))
        .limit(1);

      if (existingUsername) {
        return res.status(400).json({
          status: "error",
          message: "Username already exists",
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user with email verification token
      const emailVerificationToken = randomBytes(32).toString('hex');
      const [newUser] = await db
        .insert(users)
        .values({
          username: sanitizedUsername,
          password: hashedPassword,
          email: email.toLowerCase(),
          isAdmin: false,
          emailVerificationToken,
          emailVerified: false,
        })
        .returning();

      // Send verification email
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'noreply@goatedvips.gg',
        to: email.toLowerCase(),
        subject: 'Verify your GoatedVIPs account',
        html: `
          <h1>Welcome to GoatedVIPs!</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${process.env.APP_URL}/verify-email/${emailVerificationToken}">
            Verify Email
          </a>
        `
      });

      // Log user in after registration
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return res.status(500).json({
            status: "error",
            message: "Registration successful but login failed",
          });
        }

        return res.status(201).json({
          status: "success",
          message: "Registration successful",
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            createdAt: newUser.createdAt,
          },
        });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      return res.status(500).json({
        status: "error",
        message: "Registration failed",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Login endpoint with rate limiting
  app.post("/api/login", async (req, res, next) => {
    try {
      // Rate limiting check
      await authLimiter.consume(req.ip || 'unknown');
    } catch (error) {
      return res.status(429).json({
        status: "error",
        message: "Too many login attempts. Please try again later.",
      });
    }

    if (!req.body?.username || !req.body?.password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required"
      });
    }

    passport.authenticate(
      "local",
      (err: any, user: Express.User | false, info: IVerifyOptions) => {
        if (err) {
          console.error("Authentication error:", err);
          return res.status(500).json({
            status: "error",
            message: "Internal server error",
          });
        }

        if (!user) {
          return res.status(401).json({
            status: "error",
            message: info.message ?? "Invalid credentials",
          });
        }

        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return next(err);
          }

          return res.json({
            status: "success",
            message: "Login successful",
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              isAdmin: user.isAdmin,
              createdAt: user.createdAt,
            },
          });
        });
      },
    )(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(400).json({
        status: "error",
        message: "Not logged in",
      });
    }

    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          status: "error",
          message: "Logout failed",
        });
      }

      res.json({
        status: "success",
        message: "Logout successful",
      });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        status: "error",
        message: "Not logged in",
      });
    }

    const user = req.user;
    res.json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      }
    });
  });
  
  // JWT token refresh endpoint with rate limiting
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      // Apply rate limiting to prevent token grinding attacks
      try {
        await tokenRefreshLimiter.consume(req.ip || 'unknown');
      } catch (error) {
        return res.status(429).json({
          status: "error",
          message: "Too many refresh attempts. Please try again later.",
        });
      }
      
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          status: "error",
          message: "Refresh token required",
          code: "REFRESH_TOKEN_REQUIRED"
        });
      }
      
      // Verify the refresh token
      let payload: any;
      try {
        payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      } catch (error) {
        if ((error as Error).name === 'TokenExpiredError') {
          return res.status(401).json({
            status: "error",
            message: "Refresh token expired",
            code: "REFRESH_TOKEN_EXPIRED"
          });
        }
        
        return res.status(401).json({
          status: "error",
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN"
        });
      }
      
      // Get user data
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.id))
        .limit(1);
      
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "User not found",
          code: "USER_NOT_FOUND"
        });
      }
      
      // Check if token version matches (for forced logout)
      if (user.tokenVersion !== payload.tokenVersion) {
        return res.status(401).json({
          status: "error",
          message: "Token revoked",
          code: "TOKEN_REVOKED"
        });
      }
      
      // Generate new tokens
      const userData: JwtPayload = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        email: user.email,
        tokenVersion: user.tokenVersion || 0
      };
      
      const accessToken = generateAccessToken(userData);
      const newRefreshToken = generateRefreshToken(userData);
      
      // Set the tokens in cookies
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });
      
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/api/auth/refresh', // Only sent with refresh requests
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      return res.json({
        status: "success",
        message: "Token refreshed successfully",
        data: {
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
          }
        }
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to refresh token",
        code: "REFRESH_ERROR"
      });
    }
  });
  
  // Email verification endpoint
  app.get("/api/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "Verification token is required"
        });
      }
      
      // Find the user with this verification token
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.emailVerificationToken, token))
        .limit(1);
      
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired verification token"
        });
      }
      
      // Update the user as verified
      await db
        .update(users)
        .set({ 
          emailVerified: true,
          emailVerificationToken: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      return res.json({
        status: "success",
        message: "Email verified successfully"
      });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({
        status: "error",
        message: "Email verification failed"
      });
    }
  });
  
  // Resend email verification endpoint
  app.post("/api/resend-verification", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          status: "error",
          message: "Not logged in"
        });
      }
      
      const user = req.user;
      
      // Check if email is already verified
      if (user.emailVerified) {
        return res.status(400).json({
          status: "error",
          message: "Email is already verified"
        });
      }
      
      // Generate new verification token
      const emailVerificationToken = randomBytes(32).toString('hex');
      
      // Update user with new token
      await db
        .update(users)
        .set({ 
          emailVerificationToken,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Send verification email
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'noreply@goatedvips.gg',
        to: user.email,
        subject: 'Verify your GoatedVIPs account',
        html: `
          <h1>Welcome to GoatedVIPs!</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${process.env.APP_URL}/verify-email/${emailVerificationToken}">
            Verify Email
          </a>
        `
      });
      
      return res.json({
        status: "success",
        message: "Verification email sent successfully"
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to resend verification email"
      });
    }
  });
  
  // Password reset request endpoint
  app.post("/api/password-reset/request", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required"
        });
      }
      
      // Rate limiting check for password reset
      try {
        await sensitiveOpLimiter.consume(req.ip || 'unknown');
      } catch (error) {
        return res.status(429).json({
          status: "error",
          message: "Too many password reset attempts. Please try again later."
        });
      }
      
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      
      // For security, don't reveal if the email exists or not
      if (!user) {
        return res.json({
          status: "success",
          message: "If your email is registered, you will receive a password reset link"
        });
      }
      
      // Generate password reset token
      const passwordResetToken = randomBytes(32).toString('hex');
      const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Update user with password reset token
      await db
        .update(users)
        .set({ 
          passwordResetToken,
          passwordResetExpires,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      // Send password reset email
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'noreply@goatedvips.gg',
        to: email.toLowerCase(),
        subject: 'Reset your GoatedVIPs password',
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${process.env.APP_URL}/reset-password/${passwordResetToken}">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      
      return res.json({
        status: "success",
        message: "If your email is registered, you will receive a password reset link"
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to process password reset request"
      });
    }
  });
  
  // Password reset confirmation endpoint
  app.post("/api/password-reset/reset", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({
          status: "error",
          message: "Token and new password are required"
        });
      }
      
      // Find user by reset token
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.passwordResetToken, token),
            eq(users.passwordResetExpires !== null, true)
          )
        )
        .limit(1);
      
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired password reset token"
        });
      }
      
      // Check if token is expired
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        return res.status(400).json({
          status: "error",
          message: "Password reset token has expired"
        });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(password);
      
      // Increment token version to invalidate existing tokens
      const tokenVersion = (user.tokenVersion || 0) + 1;
      
      // Update user with new password and clear reset token
      await db
        .update(users)
        .set({ 
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          tokenVersion,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
      
      return res.json({
        status: "success",
        message: "Password has been reset successfully"
      });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to reset password"
      });
    }
  });
}

// Password utilities
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = (await scryptAsync(
    supplied,
    salt,
    64,
  )) as Buffer;
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}

/**
 * Generate a new access token for a user
 * 
 * @param user - User data to include in the token
 * @returns Signed JWT access token
 */
export function generateAccessToken(user: JwtPayload): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      email: user.email,
      tokenVersion: user.tokenVersion || 0
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate a new refresh token for a user
 * 
 * @param user - User data to include in the token
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(user: JwtPayload): string {
  return jwt.sign(
    {
      id: user.id,
      tokenVersion: user.tokenVersion || 0
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Middleware to verify JWT tokens
 * This middleware checks for the presence of a valid JWT token in the request
 * and attaches the decoded user data to the request object.
 */
export function verifyJwtToken(req: Request, res: Response, next: NextFunction) {
  // Skip auth check for public endpoints
  const publicPaths = [
    '/api/login', 
    '/api/register', 
    '/api/auth/refresh',
    '/api/verify-email',
    '/api/email-verification',
    '/api/password-reset/request',
    '/api/password-reset/verify',
    '/api/health',
    '/api/wager-races',
    '/api/affiliate',
  ];
  
  // Skip auth check for Replit WebView in development
  const isReplitWebView = req.headers['x-replit-user-id'] || 
                          req.headers['x-replit-user-name'] ||
                          (process.env.NODE_ENV !== 'production' && req.headers.referer?.includes('replit.dev'));
  
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (publicPaths.some(path => req.path.startsWith(path)) || 
      (isDevelopment && (isReplitWebView || req.method === 'GET'))) {
    return next();
  }

  // Get the token from the Authorization header or cookie
  const authHeader = req.headers.authorization;
  let token: string | undefined;
  
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Check for token in cookies as fallback
    token = req.cookies?.accessToken;
  }

  if (!token) {
    // In development, allow requests without auth for testing
    if (isDevelopment) {
      // Mock a basic user for development
      req.jwtUser = {
        id: 999,
        username: 'dev-user',
        isAdmin: false,
        email: 'dev@example.com'
      };
      return next();
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required'
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.jwtUser = decoded;
    next();
  } catch (error) {
    if ((error as Error).name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Account lockout check
 * Prevents brute force attacks by locking accounts after multiple failed login attempts
 * 
 * @param username - Account username to check
 * @returns Object indicating if the account is locked
 */
function checkAccountLockout(username: string): { locked: boolean; remainingMinutes?: number } {
  const lockoutEntry = accountLockouts.get(username);
  
  if (!lockoutEntry) {
    return { locked: false };
  }
  
  // Check if account is locked
  if (lockoutEntry.lockedUntil && lockoutEntry.lockedUntil > new Date()) {
    const remainingTime = lockoutEntry.lockedUntil.getTime() - Date.now();
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    return { 
      locked: true, 
      remainingMinutes
    };
  }
  
  // Account was locked but lockout period has expired
  if (lockoutEntry.lockedUntil) {
    accountLockouts.set(username, {
      failedAttempts: 0,
      lockedUntil: null
    });
  }
  
  return { locked: false };
}

/**
 * Record a failed login attempt and lock account if necessary
 * 
 * @param username - Account username
 */
function recordFailedLoginAttempt(username: string): void {
  const lockoutEntry = accountLockouts.get(username) || {
    failedAttempts: 0,
    lockedUntil: null
  };
  
  lockoutEntry.failedAttempts += 1;
  
  // Lock account if max attempts reached
  if (lockoutEntry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    lockoutEntry.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);
  }
  
  accountLockouts.set(username, lockoutEntry);
}