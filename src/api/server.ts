import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

// Infrastructure
import { RedisCache } from '../infrastructure/cache/RedisCache';
import { MemoryCache } from '../infrastructure/cache/MemoryCache';
import { DrizzleUserRepository } from '../infrastructure/database/DrizzleUserRepository';
import { DrizzleWagerRepository } from '../infrastructure/database/DrizzleWagerRepository';
import { DrizzleWagerAdjustmentRepository } from '../infrastructure/database/DrizzleWagerAdjustmentRepository';
import { DrizzleGoatedLinkingRepository } from '../infrastructure/database/DrizzleGoatedLinkingRepository';
import { JWTAuthService } from '../infrastructure/auth/JWTAuthService';

// Domain Services
import { UserService } from '../domain/services/UserService';
import { WagerAdjustmentService } from '../domain/services/WagerAdjustmentService';
import { WagerSyncService } from '../domain/services/WagerSyncService';
import { GoatedLinkingService } from '../domain/services/GoatedLinkingService';

// API Middleware
import { AuthMiddleware } from './middleware/auth';
import { createRateLimitMiddleware, MemoryRateLimitStore } from './middleware/rateLimit';
import { sanitizeInput } from './middleware/validation';

// Routes
import { createAuthRoutes } from './routes/auth';
import { createAffiliateRoutes } from './routes/affiliate';
import { createRaceConfigRoutes } from './routes/race-config';
import { createAdminRoutes } from './routes/admin';
import { createAdminTestRoutes } from './routes/admin-test';
import { createAdminWagerRoutes } from './routes/admin-wager';
import { createExternalAPITestRoutes } from './routes/external-api-test';
import { createLinkingRoutes } from './routes/linking';

// Types
import { ICacheService } from '../infrastructure/cache/ICacheService';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { IEmailService } from '../infrastructure/email/IEmailService';

// Configuration
interface ServerConfig {
  port: number;
  host: string;
  corsOrigins: string[];
  databaseUrl: string;
  redisHost?: string;
  redisPort?: number;
  redisPassword?: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  emailService?: IEmailService;
}

export class APIServer {
  private app: express.Application;
  private server: any;

  constructor(private config: ServerConfig) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // Compression
    this.app.use(compression());

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
      });
      next();
    });
  }

  private setupRoutes(): void {
    // Initialize cache (fallback to memory cache if Redis unavailable)
    let cache: ICacheService;
    try {
      cache = new RedisCache(
        this.config.redisHost || 'localhost', 
        this.config.redisPort || 6379, 
        this.config.redisPassword
      );
    } catch (error) {
      console.warn('Redis unavailable, using memory cache:', error);
      cache = new MemoryCache();
    }

    // Initialize repositories
    const userRepository = new DrizzleUserRepository(this.config.databaseUrl);
    const wagerRepository = new DrizzleWagerRepository(this.config.databaseUrl);
    const wagerAdjustmentRepository = new DrizzleWagerAdjustmentRepository(this.config.databaseUrl);
    const goatedLinkingRepository = new DrizzleGoatedLinkingRepository(this.config.databaseUrl);

    // Initialize core services
    const authService = new JWTAuthService(
      cache,
      userRepository,
      this.config.jwtSecret, 
      this.config.jwtRefreshSecret
    );
    const userService = new UserService(userRepository, cache);

    // Initialize domain services
    const wagerAdjustmentService = new WagerAdjustmentService(
      wagerAdjustmentRepository,
      wagerRepository,
      userRepository
    );
    const wagerSyncService = new WagerSyncService(
      wagerRepository,
      wagerAdjustmentRepository,
      userRepository
    );
    const goatedLinkingService = new GoatedLinkingService(
      goatedLinkingRepository,
      userRepository
    );

    // Initialize middleware
    const authMiddleware = new AuthMiddleware(authService, userService);
    const rateLimitStore = new MemoryRateLimitStore();
    const rateLimit = createRateLimitMiddleware(rateLimitStore);

    // Root route for API status
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Goombas x Goated VIPs v2.0 API is live',
        version: '2.0.0',
        endpoints: {
          health: '/health',
          api: '/api',
          docs: '/api/docs'
        }
      });
    });

    // Health check
    this.app.get('/health', async (req, res) => {
      let dbStatus = 'healthy';
      let cacheStatus = 'healthy';

      try {
        await userRepository.getStats();
      } catch {
        dbStatus = 'unhealthy';
      }

      try {
        await cache.ping();
      } catch {
        cacheStatus = 'unhealthy';
      }

      res.json({
        status: dbStatus === 'healthy' && cacheStatus === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: '2.0.0',
        services: {
          database: dbStatus,
          cache: cacheStatus,
        }
      });
    });

    // API info
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'Goombas x Goated VIPs API',
        version: '2.0.0',
        description: 'Secure, scalable API for Goombas x Goated VIPs platform',
        endpoints: {
          auth: '/api/auth',
          affiliate: '/api/affiliate',
          'race-config': '/api/race-config',
          admin: '/api/admin',
          'admin-wagers': '/api/admin/wagers',
          linking: '/api/linking',
          health: '/health',
        },
      });
    });

    // Real authentication routes
    this.app.use('/api/auth', createAuthRoutes(authService, userService, rateLimit));

    // Real affiliate routes - Core business feature
    this.app.use('/api/affiliate', createAffiliateRoutes());

    // Race configuration routes
    this.app.use('/api/race-config', createRaceConfigRoutes());

    // Admin routes
    this.app.use('/api/admin', createAdminRoutes(userService, wagerAdjustmentService, goatedLinkingService, authMiddleware, rateLimit));
    this.app.use('/api/admin/test', createAdminTestRoutes(authMiddleware));
    this.app.use('/api/admin/wagers', createAdminWagerRoutes(
      wagerAdjustmentService,
      wagerSyncService,
      authMiddleware,
      rateLimit
    ));
    this.app.use('/api/linking', createLinkingRoutes(
      goatedLinkingService,
      authMiddleware,
      rateLimit
    ));
    this.app.use('/api/admin/external-api', createExternalAPITestRoutes(authMiddleware));

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND',
        path: req.path,
        method: req.method,
      });
    });
  }




  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);

      const isDevelopment = process.env.NODE_ENV === 'development';

      res.status(error.status || 500).json({
        success: false,
        error: isDevelopment ? error.message : 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        ...(isDevelopment && { stack: error.stack }),
      });
    });
  }

  public async start(): Promise<void> {
    try {
      this.server = createServer(this.app);

      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`🚀 Server running on http://${this.config.host}:${this.config.port}`);
        console.log(`📊 Health check available at http://${this.config.host}:${this.config.port}/health`);
        console.log(`🔐 API available at http://${this.config.host}:${this.config.port}/api`);
      });

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }
}