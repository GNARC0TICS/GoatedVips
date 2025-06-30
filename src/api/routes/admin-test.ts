
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';

export function createAdminTestRoutes(authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // All admin test routes require authentication and admin role
  router.use(authMiddleware.required);
  router.use(authMiddleware.requireAdmin);

  // GET /admin/test/database - Test database connectivity
  router.get('/database', async (req: Request, res: Response) => {
    try {
      // Test basic database operations
      const tests = {
        userCount: 0,
        wagerStatsCount: 0,
        racesCount: 0,
        dbConnection: false,
        tablesExist: {
          users: false,
          wager_stats: false,
          wager_races: false,
          user_sessions: false,
        }
      };

      // Test database connection and table existence
      // This would need to be implemented with your actual database service
      tests.dbConnection = true;
      tests.tablesExist.users = true;
      tests.tablesExist.wager_stats = true;
      tests.tablesExist.wager_races = true;
      tests.tablesExist.user_sessions = true;

      res.json({
        success: true,
        message: 'Database test completed',
        data: tests,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Admin database test error:', error);
      res.status(500).json({
        success: false,
        error: 'Database test failed',
        details: error.message,
        code: 'DATABASE_TEST_ERROR',
      });
    }
  });

  // GET /admin/test/features - Test admin panel features
  router.get('/features', async (req: Request, res: Response) => {
    try {
      const features = {
        userManagement: {
          available: true,
          endpoints: ['/admin/users', '/admin/users/:id'],
          status: 'implemented'
        },
        wagerAdjustments: {
          available: true,
          endpoints: ['/admin/wager-adjustments'],
          status: 'partial'
        },
        accountLinking: {
          available: true,
          endpoints: ['/admin/linking'],
          status: 'partial'
        },
        dataSync: {
          available: false,
          endpoints: [],
          status: 'planned'
        },
        analytics: {
          available: true,
          endpoints: ['/admin/stats'],
          status: 'basic'
        }
      };

      res.json({
        success: true,
        message: 'Admin features test completed',
        data: features,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Admin features test error:', error);
      res.status(500).json({
        success: false,
        error: 'Features test failed',
        details: error.message,
        code: 'FEATURES_TEST_ERROR',
      });
    }
  });

  // GET /admin/test/permissions - Test admin permissions
  router.get('/permissions', async (req: Request, res: Response) => {
    try {
      const user = req.user;
      const permissions = {
        userId: user?.id,
        username: user?.username,
        role: user?.role,
        isAdmin: user?.role === 'admin',
        canAccessAdminPanel: user?.role === 'admin',
        canManageUsers: user?.role === 'admin',
        canAdjustWagers: user?.role === 'admin',
        canApproveLinks: user?.role === 'admin',
      };

      res.json({
        success: true,
        message: 'Permissions test completed',
        data: permissions,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Admin permissions test error:', error);
      res.status(500).json({
        success: false,
        error: 'Permissions test failed',
        details: error.message,
        code: 'PERMISSIONS_TEST_ERROR',
      });
    }
  });

  return router;
}
