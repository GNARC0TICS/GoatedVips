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
import { JWTAuthService } from '../infrastructure/auth/JWTAuthService';

// Domain Services
import { UserService } from '../domain/services/UserService';

// API Middleware
import { AuthMiddleware } from './middleware/auth';
import { createRateLimitMiddleware, MemoryRateLimitStore } from './middleware/rateLimit';
import { sanitizeInput } from './middleware/validation';

// Routes
import { createAuthRoutes } from './routes/auth';

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

    // Initialize services
    const userRepository = new DrizzleUserRepository(this.config.databaseUrl);
    const authService = new JWTAuthService(
      cache,
      userRepository,
      this.config.jwtSecret, 
      this.config.jwtRefreshSecret
    );
    const userService = new UserService(userRepository, cache);
    
    // Initialize middleware
    const authMiddleware = new AuthMiddleware(authService, cache);
    const rateLimitStore = new MemoryRateLimitStore();
    const rateLimit = createRateLimitMiddleware(rateLimitStore);

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
          users: '/api/users',
          wagers: '/api/wagers',
          races: '/api/races',
          leaderboard: '/api/leaderboard',
          health: '/health',
        },
      });
    });

    // Real authentication routes
    this.app.use('/api/auth', createAuthRoutes(authService, userService, rateLimit));

    // Mock user routes (to be replaced with real routes)
    this.app.use('/api/users', this.createMockUserRoutes());

    // Mock leaderboard routes (to be replaced with real routes)
    this.app.use('/api/leaderboard', this.createMockLeaderboardRoutes());

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

  private createMockAuthRoutes() {
    const router = require('express').Router();

    // Mock login
    router.post('/login', (req, res) => {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required',
          code: 'MISSING_CREDENTIALS'
        });
      }

      // Mock successful login
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'user_123',
            username: 'testuser',
            email: email,
            role: 'user',
            isEmailVerified: true,
          },
          tokens: {
            accessToken: 'mock_access_token_123',
            refreshToken: 'mock_refresh_token_123',
          }
        }
      });
    });

    // Mock register
    router.post('/register', (req, res) => {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username, email, and password are required',
          code: 'MISSING_FIELDS'
        });
      }

      // Mock successful registration
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: 'user_' + Date.now(),
            username: username,
            email: email,
            role: 'user',
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
          },
          tokens: {
            accessToken: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
          }
        }
      });
    });

    // Mock me endpoint
    router.get('/me', (req, res) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          code: 'NO_TOKEN'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: 'user_123',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user',
            isEmailVerified: true,
            createdAt: '2024-01-01T00:00:00Z',
          }
        }
      });
    });

    return router;
  }

  private createMockUserRoutes() {
    const router = require('express').Router();

    // Get user profile
    router.get('/:id', (req, res) => {
      res.json({
        success: true,
        data: {
          user: {
            id: req.params.id,
            username: 'testuser',
            displayName: 'Test User',
            avatar: null,
            role: 'user',
            stats: {
              totalWager: 1500.50,
              gamesPlayed: 45,
              winRate: 0.67,
              rank: 15,
            },
            isOnline: true,
            lastSeen: new Date().toISOString(),
          }
        }
      });
    });

    return router;
  }

  private createMockLeaderboardRoutes() {
    const router = require('express').Router();

    // Get leaderboard
    router.get('/', (req, res) => {
      const mockLeaderboard = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        user: {
          id: `user_${i + 1}`,
          username: `player${i + 1}`,
          displayName: `Player ${i + 1}`,
          avatar: null,
        },
        stats: {
          totalWager: Math.floor(Math.random() * 10000) + 1000,
          gamesPlayed: Math.floor(Math.random() * 100) + 10,
          winRate: Math.round((Math.random() * 0.5 + 0.3) * 100) / 100,
        },
        change: Math.floor(Math.random() * 10) - 5, // -5 to +5
      }));

      res.json({
        success: true,
        data: {
          leaderboard: mockLeaderboard,
          pagination: {
            page: 1,
            limit: 10,
            total: 100,
          },
          lastUpdated: new Date().toISOString(),
        }
      });
    });

    return router;
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