import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../../domain/services/UserService';
import { JWTAuthService } from '../../infrastructure/auth/JWTAuthService';
import { AuthMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';

// Request schemas
const RegisterSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const VerifyEmailSchema = z.object({
  token: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

export function createAuthRoutes(
  authService: JWTAuthService,
  userService: UserService,
  rateLimit: any
): Router {
  const router = Router();
  const authMiddleware = new AuthMiddleware(authService);

  // POST /auth/register - Register new user
  router.post('/register', 
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 attempts per 15 minutes
    validateRequest(RegisterSchema),
    async (req: Request, res: Response) => {
      try {
        const { username, email, password, displayName } = req.body;
        
        const user = await userService.createUser({
          username,
          email,
          passwordHash: password, // Will be hashed in service
          displayName,
        });
        
        // Generate tokens
        const tokens = await authService.generateTokens(
          user,
          req.ip,
          req.get('User-Agent')
        );
        
        // Set secure cookie
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.status(201).json({
          success: true,
          message: 'Registration successful',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              emailVerified: user.emailVerified,
            },
            tokens: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          },
        });
      } catch (error: any) {
        console.error('Registration error:', error);
        
        if (error.message.includes('already exists') || error.message.includes('already taken')) {
          return res.status(409).json({
            success: false,
            error: error.message,
            code: 'DUPLICATE_USER',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Registration failed',
          code: 'REGISTRATION_ERROR',
        });
      }
    }
  );

  // POST /auth/login - User login
  router.post('/login',
    rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 attempts per 15 minutes
    validateRequest(LoginSchema),
    async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;
        
        const user = await userService.authenticate(email, password);
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password',
            code: 'INVALID_CREDENTIALS',
          });
        }
        
        if (user.status !== 'active') {
          return res.status(403).json({
            success: false,
            error: 'Account is not active',
            code: 'ACCOUNT_INACTIVE',
          });
        }
        
        // Generate tokens
        const tokens = await authService.generateTokens(
          user,
          req.ip,
          req.get('User-Agent')
        );
        
        // Set secure cookie
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              isEmailVerified: user.emailVerified,
              goatedLinked: user.goatedLinked,
              preferences: user.preferences,
            },
            tokens: {
              accessToken: tokens.accessToken,
              refreshToken: tokens.refreshToken,
            },
          },
        });
      } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({
          success: false,
          error: 'Login failed',
          code: 'LOGIN_ERROR',
        });
      }
    }
  );

  // GET /auth/me - Get current user info
  router.get('/me',
    authMiddleware.required,
    async (req: Request, res: Response) => {
      try {
        const user = await userService.findById(req.user!.id);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND',
          });
        }
        
        res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              bio: user.bio,
              avatar: user.avatar,
              profileColor: user.profileColor,
              role: user.role,
              status: user.status,
              isEmailVerified: user.emailVerified,
              twoFactorEnabled: user.twoFactorEnabled,
              goatedId: user.goatedId,
              goatedUsername: user.goatedUsername,
              goatedLinked: user.goatedLinked,
              goatedVerified: user.goatedVerified,
              privacy: user.privacy,
              preferences: user.preferences,
              lastLoginAt: user.lastLoginAt,
              createdAt: user.createdAt,
            },
          },
        });
      } catch (error: any) {
        console.error('Get user error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user info',
          code: 'GET_USER_ERROR',
        });
      }
    }
  );

  // POST /auth/logout - User logout
  router.post('/logout',
    async (req: Request, res: Response) => {
      try {
        // Clear refresh token cookie
        res.clearCookie('refreshToken');
        
        res.json({
          success: true,
          message: 'Logged out successfully',
        });
      } catch (error: any) {
        console.error('Logout error:', error);
        res.status(500).json({
          success: false,
          error: 'Logout failed',
          code: 'LOGOUT_ERROR',
        });
      }
    }
  );

  return router;
}