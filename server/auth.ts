import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema, type SelectUser } from "@db/schema";
import { db } from "@db";
import { eq, sql } from "drizzle-orm";
import express from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
// Import Resend if available, otherwise provide a fallback email service
import { Resend } from 'resend';
// Fallback email service for environments without Resend configured
const sendVerificationEmail = async (to: string, subject: string, html: string) => {
  try {
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'noreply@goatedvips.gg',
        to,
        subject,
        html
      });
    } else {
      // Log email for development without sending
      console.log(`[EMAIL FALLBACK] Would send email to ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html}`);
    }
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't throw - email sending shouldn't block registration
  }
};

const scryptAsync = promisify(scrypt);

// Rate limiter for registration and login attempts
const authLimiter = new RateLimiterMemory({
  points: 20, // 20 attempts
  duration: 60 * 5, // per 5 minutes
  blockDuration: 60 * 2, // Block for 2 minutes
});

declare global {
  namespace Express {
    interface User extends SelectUser {}
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
            // Use type assertion to satisfy TypeScript
            const adminUser = {
              id: 1,
              username: process.env.ADMIN_USERNAME || 'admin',
              password: 'ADMIN_PASSWORD_HASH', // Placeholder value to satisfy TypeScript; not used for authentication
              email: `${process.env.ADMIN_USERNAME || 'admin'}@admin.local`,
              isAdmin: true
            } as Express.User;
            
            return done(null, adminUser);
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
      
      // Use raw SQL to insert the user with all fields to avoid type issues
      const insertResult = await db.execute(sql`
        INSERT INTO users (
          username,
          password,
          email,
          is_admin,
          email_verification_token,
          email_verified,
          created_at,
          profile_color
        ) VALUES (
          ${sanitizedUsername},
          ${hashedPassword},
          ${email.toLowerCase()},
          false,
          ${emailVerificationToken},
          false,
          CURRENT_TIMESTAMP,
          '#D7FF00'
        )
        RETURNING *
      `);
      
      // Get the newly created user from the result
      const newUser = result.rows[0];

      // Send verification email using our utility function
      await sendVerificationEmail(
        email.toLowerCase(),
        'Verify your GoatedVIPs account',
        `
          <h1>Welcome to GoatedVIPs!</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${process.env.APP_URL}/verify-email/${emailVerificationToken}">
            Verify Email
          </a>
        `
      );

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