import passport from "passport";
import { IVerifyOptions, Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import { randomBytes } from "crypto";
import { users, insertUserSchema, type SelectUser } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import express from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { 
  preparePassword, 
  verifyPassword, 
  AUTH_ERROR_MESSAGES
} from "./utils/auth-utils";

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
        // Note: We need to provide all required User fields for TypeScript
        if (username === process.env.ADMIN_USERNAME) {
          if (password === process.env.ADMIN_PASSWORD) {
            // Create a minimal admin user - using type casting to bypass TypeScript
            // since this is an in-memory object only used for authentication
            const adminUser = {
              id: 1,
              username: process.env.ADMIN_USERNAME || 'admin',
              password: '', // Password already verified
              email: `${process.env.ADMIN_USERNAME || 'admin'}@admin.local`,
              isAdmin: true,
              createdAt: new Date(),
              emailVerified: true
            } as unknown as Express.User;
            
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
          return done(null, false, { message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS });
        }

        // Using the centralized password verification utility
        const isMatch = await verifyPassword(sanitizedPassword, user.password);
        if (!isMatch) {
          return done(null, false, { message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS });
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

      // Prepare password for storage (cleartext for testing as requested)
      const preparedPassword = await preparePassword(password);

      // Create user with email verification token
      const emailVerificationToken = randomBytes(32).toString('hex');
      const [newUser] = await db
        .insert(users)
        .values({
          username: sanitizedUsername,
          password: preparedPassword,
          email: email.toLowerCase(),
          isAdmin: false,
          emailVerificationToken,
          emailVerified: false,
        })
        .returning();

      // Skip email verification for testing
      console.log('Email verification skipped for testing');
      // Would normally send an email here
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // await resend.emails.send({
      //   from: 'noreply@goatedvips.gg',
      //   to: email.toLowerCase(),
      //   subject: 'Verify your GoatedVIPs account',
      //   html: `
      //     <h1>Welcome to GoatedVIPs!</h1>
      //     <p>Click the link below to verify your email address:</p>
      //     <a href="${process.env.APP_URL}/verify-email/${emailVerificationToken}">
      //       Verify Email
      //     </a>
      //   `
      // });

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

// Password utilities are now centralized in utils/auth-utils.ts
