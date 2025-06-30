import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { UserService } from '../../domain/services/UserService';
import { WagerAdjustmentService } from '../../domain/services/WagerAdjustmentService';
import { GoatedLinkingService } from '../../domain/services/GoatedLinkingService';
import { AuthMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rateLimit';

// Admin request schemas
const AdminCreateUserSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'moderator', 'admin']).default('user'),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});

const AdminUpdateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  emailVerified: z.boolean().optional(),
  goatedId: z.string().optional(),
  goatedUsername: z.string().optional(),
  goatedLinked: z.boolean().optional(),
  goatedVerified: z.boolean().optional(),
});

const AdminSearchUsersSchema = z.object({
  query: z.string().min(1).max(100).optional(),
  role: z.enum(['user', 'moderator', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const AdminUserActionSchema = z.object({
  action: z.enum(['suspend', 'activate', 'verify_email', 'unlink_goated']),
  reason: z.string().min(1).max(500).optional(),
});

export function createAdminRoutes(
  userService: UserService,
  wagerAdjustmentService: WagerAdjustmentService,
  goatedLinkingService: GoatedLinkingService,
  authMiddleware: AuthMiddleware,
  rateLimit: any
): Router {
  const router = Router();

  // All admin routes require authentication and admin role
  router.use(authMiddleware.required);
  router.use(authMiddleware.requireAdmin);

  // Enhanced rate limiting for admin operations
  router.use(rateLimitMiddleware({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 requests per 15 minutes

  // GET /admin/users - Search and list users
  router.get('/users',
    validateRequest(AdminSearchUsersSchema, 'query'),
    async (req: Request, res: Response) => {
      try {
        const { query, role, status, limit, offset } = req.query as any;
        
        let users;
        if (query) {
          users = await userService.search(query, limit, offset);
        } else {
          // TODO: Implement filtered search in UserService
          users = await userService.search('', limit, offset);
        }

        // Filter by role and status if provided
        let filteredUsers = users.users;
        if (role) {
          filteredUsers = filteredUsers.filter(user => user.role === role);
        }
        if (status) {
          filteredUsers = filteredUsers.filter(user => user.status === status);
        }

        res.json({
          success: true,
          data: {
            users: filteredUsers.map(user => ({
              id: user.id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              status: user.status,
              emailVerified: user.emailVerified,
              goatedLinked: user.goatedLinked,
              goatedUsername: user.goatedUsername,
              lastLoginAt: user.lastLoginAt,
              createdAt: user.createdAt,
            })),
            total: users.total,
            limit,
            offset,
          },
        });
      } catch (error: any) {
        console.error('Admin search users error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to search users',
          code: 'ADMIN_SEARCH_ERROR',
        });
      }
    }
  );

  // GET /admin/users/:id - Get specific user details
  router.get('/users/:id',
    async (req: Request, res: Response) => {
      try {
        const user = await userService.findById(req.params.id);
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
              emailVerified: user.emailVerified,
              twoFactorEnabled: user.twoFactorEnabled,
              goatedId: user.goatedId,
              goatedUsername: user.goatedUsername,
              goatedLinked: user.goatedLinked,
              goatedVerified: user.goatedVerified,
              privacySettings: user.privacySettings,
              preferences: user.preferences,
              lastLoginAt: user.lastLoginAt,
              lastActiveAt: user.lastActiveAt,
              loginCount: user.loginCount,
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          },
        });
      } catch (error: any) {
        console.error('Admin get user error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get user',
          code: 'ADMIN_GET_USER_ERROR',
        });
      }
    }
  );

  // POST /admin/users - Create new user
  router.post('/users',
    validateRequest(AdminCreateUserSchema),
    async (req: Request, res: Response) => {
      try {
        const userData = req.body;
        
        const user = await userService.createUser({
          ...userData,
          passwordHash: userData.password, // Will be hashed in service
        });

        res.status(201).json({
          success: true,
          message: 'User created successfully',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              status: user.status,
              emailVerified: user.emailVerified,
              createdAt: user.createdAt,
            },
          },
        });
      } catch (error: any) {
        console.error('Admin create user error:', error);
        
        if (error.message.includes('already exists') || error.message.includes('already taken')) {
          return res.status(409).json({
            success: false,
            error: error.message,
            code: 'DUPLICATE_USER',
          });
        }
        
        res.status(500).json({
          success: false,
          error: 'Failed to create user',
          code: 'ADMIN_CREATE_USER_ERROR',
        });
      }
    }
  );

  // PUT /admin/users/:id - Update user
  router.put('/users/:id',
    validateRequest(AdminUpdateUserSchema),
    async (req: Request, res: Response) => {
      try {
        const userId = req.params.id;
        const updateData = req.body;
        
        const user = await userService.updateProfile(userId, updateData);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND',
          });
        }

        res.json({
          success: true,
          message: 'User updated successfully',
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              displayName: user.displayName,
              role: user.role,
              status: user.status,
              emailVerified: user.emailVerified,
              updatedAt: user.updatedAt,
            },
          },
        });
      } catch (error: any) {
        console.error('Admin update user error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to update user',
          code: 'ADMIN_UPDATE_USER_ERROR',
        });
      }
    }
  );

  // POST /admin/users/:id/actions - Perform user actions (suspend, activate, etc.)
  router.post('/users/:id/actions',
    validateRequest(AdminUserActionSchema),
    async (req: Request, res: Response) => {
      try {
        const userId = req.params.id;
        const { action, reason } = req.body;
        
        let updateData: any = {};
        let message = '';

        switch (action) {
          case 'suspend':
            updateData = { status: 'suspended' };
            message = 'User suspended successfully';
            break;
          case 'activate':
            updateData = { status: 'active' };
            message = 'User activated successfully';
            break;
          case 'verify_email':
            updateData = { emailVerified: true };
            message = 'User email verified successfully';
            break;
          case 'unlink_goated':
            updateData = { 
              goatedId: null, 
              goatedUsername: null, 
              goatedLinked: false, 
              goatedVerified: false 
            };
            message = 'Goated account unlinked successfully';
            break;
          default:
            return res.status(400).json({
              success: false,
              error: 'Invalid action',
              code: 'INVALID_ACTION',
            });
        }

        const user = await userService.updateProfile(userId, updateData);
        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND',
          });
        }

        // TODO: Add audit logging here
        console.log(`Admin ${req.user?.id} performed action ${action} on user ${userId}. Reason: ${reason || 'No reason provided'}`);

        res.json({
          success: true,
          message,
          data: {
            user: {
              id: user.id,
              username: user.username,
              status: user.status,
              emailVerified: user.emailVerified,
              goatedLinked: user.goatedLinked,
            },
          },
        });
      } catch (error: any) {
        console.error('Admin user action error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to perform user action',
          code: 'ADMIN_ACTION_ERROR',
        });
      }
    }
  );

  // GET /admin/stats - Get admin dashboard stats
  router.get('/stats',
    async (req: Request, res: Response) => {
      try {
        const stats = await userService.getStats();
        
        res.json({
          success: true,
          data: {
            users: stats,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (error: any) {
        console.error('Admin stats error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get admin stats',
          code: 'ADMIN_STATS_ERROR',
        });
      }
    }
  );

  return router;
}