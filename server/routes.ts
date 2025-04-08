import { Router, type Express, type Request, type Response, type NextFunction } from "express";
import compression from "compression";
import { db } from "@db";
import { sql } from "drizzle-orm";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { log as baseLog } from "./vite";
// Enhanced log wrapper to handle objects
function log(message: string | object, source?: string): void {
  if (typeof message === 'object') {
    baseLog(JSON.stringify(message), source);
  } else {
    baseLog(message, source);
  }
}
import { createWebSocketServer, broadcast, closeAllWebSocketServers } from "./config/websocket";
import { API_CONFIG } from "./config/api";
import { RateLimiterMemory, type RateLimiterRes } from 'rate-limiter-flexible';
import bonusChallengesRouter from "./routes/bonus-challenges";
import usersRouter from "./routes/users";
import goombasAdminRouter from "./routes/goombas-admin";
import accountLinkingRouter from "./routes/account-linking";
import apiRoutes from "./routes/apiRoutes";
import { requireAdmin } from "./middleware/admin";
import { wagerRaces, users, transformationLogs, wagerRaceParticipants } from "@db/schema";
import { ensureUserProfile } from "./index";
// Import platformApiService for any API-related needs
import { platformApiService } from "./services/platformApiService";

type RateLimitTier = 'HIGH' | 'MEDIUM' | 'LOW';
const rateLimits: Record<RateLimitTier, { points: number; duration: number }> = {
  HIGH: { points: 30, duration: 60 },
  MEDIUM: { points: 15, duration: 60 },
  LOW: { points: 5, duration: 60 }
};

const rateLimiters = {
  high: new RateLimiterMemory(rateLimits.HIGH),
  medium: new RateLimiterMemory(rateLimits.MEDIUM),
  low: new RateLimiterMemory(rateLimits.LOW),
};

const createRateLimiter = (tier: keyof typeof rateLimiters) => {
  const limiter = rateLimiters[tier];
  return async (req: any, res: any, next: any) => {
    try {
      const rateLimitRes = await limiter.consume(req.ip);
      res.setHeader('X-RateLimit-Limit', rateLimits[tier.toUpperCase() as RateLimitTier].points);
      res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString());
      next();
    } catch (rejRes) {
      const rejection = rejRes as RateLimiterRes;
      res.setHeader('Retry-After', Math.ceil(rejection.msBeforeNext / 1000));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rejection.msBeforeNext).toISOString());
      res.status(429).json({
        status: 'error',
        message: 'Too many requests',
        retryAfter: Math.ceil(rejection.msBeforeNext / 1000)
      });
    }
  };
};

import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import type { SelectUser } from "@db/schema";
import { cacheService, withCache } from "./services/cacheService";

/**
 * Enhanced caching middleware with support for different caching strategies
 * 
 * @param ttl - Time to live in milliseconds (default: 30 seconds)
 * @param namespace - Optional cache namespace for better organization
 */
const cacheMiddleware = (ttl = 30000, namespace = 'api') => async (req: Request, res: Response, next: NextFunction) => {
  // Generate a cache key based on the request
  const key = `${req.method}-${req.originalUrl}-${JSON.stringify(req.query)}`;
  const { data, found, stale } = cacheService.get(key, { namespace, ttl, staleWhileRevalidate: true });
  
  if (found) {
    // Check if headers have already been sent
    if (res.headersSent) {
      console.log(`Headers already sent in cacheMiddleware for ${key}, skipping cache response`);
      return;
    }
    
    // Set appropriate cache headers
    res.setHeader('X-Cache', stale ? 'STALE' : 'HIT');
    
    // If data is stale, trigger a background refresh but still return cached data
    if (stale && !cacheService.isRefreshing(key, namespace)) {
      // Clone the request and continue processing in the background
      cacheService.markRefreshing(key, namespace);
      
      // Use a copy of the response that only captures the data
      const resCopy = {
        json: (body: any) => {
          cacheService.set(key, body, { namespace, ttl });
          cacheService.markRefreshComplete(key, namespace);
          return body;
        },
        status: () => resCopy,
        send: () => {},
        end: () => {},
      };
      
      // Process the request in the background
      try {
        // Store the original json method
        const originalJson = res.json;
        res.json = resCopy.json;
        
        // Execute the next middleware
        await new Promise((resolve) => {
          next();
          resolve(undefined);
        });
        
        // Restore the original json method
        res.json = originalJson;
      } catch (error) {
        console.error('Background refresh error:', error);
        cacheService.markRefreshComplete(key, namespace);
      }
    }
    
    // Final check if headers have already been sent
    if (!res.headersSent) {
      return res.json(data);
    } else {
      console.log(`Headers sent during cache middleware processing for ${key}`);
    }
  }
  
  // No cache hit, proceed with request
  res.setHeader('X-Cache', 'MISS');
  
  // Capture the response to store in cache
  const originalJson = res.json;
  res.json = (body: any) => {
    cacheService.set(key, body, { namespace, ttl });
    return originalJson.call(res, body);
  };
  
  next();
};

// Router setup
const router = Router();
router.use(compression());

// Constants
const CACHE_TIMES = {
  SHORT: 15000,    // 15 seconds
  MEDIUM: 60000,   // 1 minute
  LONG: 300000,    // 5 minutes
  VERY_LONG: 900000 // 15 minutes
};

// Health check endpoint
router.get("/health", async (_req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);

    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      db: "connected",
      telegramBot: "not initialized", //removed global.botInstance check
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: process.env.NODE_ENV === "production" 
        ? "Health check failed" 
        : error instanceof Error ? error.message : String(error)
    });
  }
});

// Special route to trigger sync of profiles from the API manually
router.get("/sync-profiles", requireAdmin, async (_req: Request, res: Response) => {
  try {
    // Import the goatedApiService dynamically to avoid circular dependencies
    const goatedApiService = await import('./services/goatedApiService').then(module => module.default);
    
    console.log("Manually triggered profile sync started");
    
    // Begin the sync process
    const result = await goatedApiService.syncUserProfiles();
    
    // Start the wager data update as well
    const wagerResult = await goatedApiService.updateAllWagerData();
    
    res.json({ 
      status: "success", 
      message: "Profile sync completed", 
      stats: {
        profiles: {
          created: result.created,
          updated: result.updated,
          existing: result.existing
        },
        wagerData: {
          updated: wagerResult
        }
      }
    });
  } catch (error) {
    console.error("Manual profile sync failed:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Profile sync failed", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Note: Wager race endpoints have been moved to apiRoutes.ts
// Use the platformApiService for wager race data access

// Export functions and router
export { router };


// API Routes configuration
function setupAPIRoutes(app: Express) {
  // API middleware - ensure these run before any API route
  app.use('/api', (req, res, next) => {
    // Set common API headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  // Mount all API routes under /api prefix
  app.use("/api", apiRoutes); // Main API routes with affiliate/stats, wager-races, etc.
  app.use("/api/bonus", bonusChallengesRouter);
  app.use("/api/users", usersRouter); // For backward compatibility
  app.use("/users", usersRouter);     // New public profile routes
  app.use("/api/account", accountLinkingRouter); // Account linking routes
  app.use("/api", router); // Added this line
  
  // Mount our custom admin routes at the non-obvious URL path
  app.use("/goombas.net", goombasAdminRouter);

  // Add other API routes here, ensuring they're all prefixed with /api
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy" });
  });

  app.post("/api/batch", createRateLimiter('medium'), batchHandler);

  // Direct test endpoint for creating users
  app.post("/api/create-test-users", async (_req, res) => {
    try {
      // Create 3 test users for development
      const testUsers = [
        { username: "testuser1", email: "test1@example.com", profileColor: "#D7FF00" },
        { username: "testuser2", email: "test2@example.com", profileColor: "#10B981" },
        { username: "testuser3", email: "test3@example.com", profileColor: "#3B82F6" }
      ];
      
      let createdCount = 0;
      let existingCount = 0;
      const errors = [];
      
      for (const user of testUsers) {
        try {
          // Check if user already exists
          const existingUser = await db.select()
            .from(users)
            .where(sql`username = ${user.username}`)
            .limit(1);
          
          if (existingUser && existingUser.length > 0) {
            existingCount++;
            continue;
          }
          
          // Generate a unique ID starting from a high number to avoid conflicts
          const randomId = 1000 + Math.floor(Math.random() * 9000);
          
          // Insert the user directly
          await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, 
              profile_color, bio, is_admin, email_verified
            ) VALUES (
              ${randomId}, ${user.username}, ${user.email}, '', ${new Date()}, 
              ${user.profileColor}, 'Test user bio', false, true
            )
          `);
          
          createdCount++;
          console.log(`Created test user: ${user.username} with ID ${randomId}`);
        } catch (err) {
          const insertError = err as Error;
          console.error(`Error creating test user ${user.username}:`, insertError);
          errors.push(`Failed to create ${user.username}: ${insertError.message || 'Unknown error'}`);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Created ${createdCount} test users, ${existingCount} already existed`,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error("Error creating test users:", error);
      res.status(500).json({ 
        error: "Failed to create test users",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Note: Affiliate stats endpoint has been moved to apiRoutes.ts
  // Use the platformApiService for affiliate data access

  // Admin routes with custom URL path
  app.get("/goated-supervisor/analytics",
    requireAdmin, // Ensure admin middleware is applied
    createRateLimiter('low'),
    cacheMiddleware(CACHE_TIMES.LONG),
    async (_req, res) => {
      // Flag to track if response has been sent
      let responseHasBeenSent = false;
      
      try {
        // If the cacheMiddleware has already sent a response, don't proceed further
        if (res.headersSent) {
          responseHasBeenSent = true;
          return;
        }
        
        log('Fetching leaderboard data for analytics...');
        
        // Use our platform API service to get leaderboard data
        const leaderboardData = await platformApiService.getLeaderboardData();
        
        // Process all entries to get totals
        const allUsers = [
          ...(leaderboardData.data?.today?.data || []),
          ...(leaderboardData.data?.weekly?.data || []),
          ...(leaderboardData.data?.monthly?.data || []),
          ...(leaderboardData.data?.all_time?.data || [])
        ];
        
        // Deduplicate users
        const uniqueUsers = Array.from(new Set(allUsers.map(user => user.uid)))
          .map(uid => allUsers.find(user => user.uid === uid))
          .filter(Boolean);
        
        const totals = uniqueUsers.reduce((acc: any, entry: any) => {
          acc.dailyTotal += entry.wagered?.today || 0;
          acc.weeklyTotal += entry.wagered?.this_week || 0;
          acc.monthlyTotal += entry.wagered?.this_month || 0;
          acc.allTimeTotal += entry.wagered?.all_time || 0;
          return acc;
        }, {
          dailyTotal: 0,
          weeklyTotal: 0,
          monthlyTotal: 0,
          allTimeTotal: 0
        });

        const [raceCount, activeRaceCount] = await Promise.all([
          db.select({ count: sql`count(*)` }).from(wagerRaces),
          db.select({ count: sql`count(*)` }).from(wagerRaces).where(eq(wagerRaces.status, 'live')),
        ]);

        const stats = {
          totalRaces: raceCount[0].count,
          activeRaces: activeRaceCount[0].count,
          wagerTotals: totals,
          userCount: uniqueUsers.length
        };

        // Check both responseHasBeenSent flag and res.headersSent for maximum safety
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.json(stats);
        }
      } catch (error) {
        // Only send error response if no response has been sent yet (double-check)
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.status(500).json({ 
            error: "Failed to fetch analytics", 
            details: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  );


  app.get("/api/wheel/check-eligibility",
    createRateLimiter('high'),
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: "error",
            message: "Authentication required"
          });
        }

        const [lastSpin] = await db
          .select({ timestamp: sql`MAX(timestamp)` })
          .from(sql`wheel_spins`)
          .where(sql`user_id = ${(req.user as SelectUser).id}`)
          .limit(1);

        const now = new Date();
        const lastSpinDate = lastSpin?.timestamp ? new Date(lastSpin.timestamp as string) : null;

        const canSpin = !lastSpinDate ||
          (now.getUTCDate() !== lastSpinDate.getUTCDate() ||
            now.getUTCMonth() !== lastSpinDate.getUTCMonth() ||
            now.getUTCFullYear() !== lastSpinDate.getUTCFullYear());

        res.json({
          canSpin,
          lastSpin: lastSpinDate?.toISOString() || null
        });
      } catch (error) {
        console.error("Error checking wheel spin eligibility:", error);
        res.status(500).json({
          status: "error",
          message: "Failed to check eligibility"
        });
      }
    }
  );

  app.post("/api/wheel/record-spin",
    createRateLimiter('medium'),
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: "error",
            message: "Authentication required"
          });
        }

        const result = wheelSpinSchema.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            status: "error",
            message: "Invalid request data",
            errors: result.error.issues
          });
        }

        const { segmentIndex, reward } = result.data;

        await db.execute(
          sql`INSERT INTO wheel_spins (user_id, segment_index, reward_code, timestamp)
              VALUES (${(req.user as SelectUser).id}, ${segmentIndex}, ${reward}, NOW())`
        );

        if (reward) {
          await db.execute(
            sql`INSERT INTO bonus_codes (code, user_id, claimed_at, expires_at)
                VALUES (${reward}, ${(req.user as SelectUser).id}, NOW(), NOW() + INTERVAL '24 hours')`
          );
        }

        res.json({
          status: "success",
          message: "Spin recorded successfully"
        });
      } catch (error) {
        console.error("Error recording wheel spin:", error);
        res.status(500).json({
          status: "error",
          message: "Failed to record spin"
        });
      }
    }
  );
  app.get("/goated-supervisor/transformation-metrics",
    requireAdmin,
    createRateLimiter('medium'),
    cacheMiddleware(CACHE_TIMES.LONG),
    async (_req, res) => {
      // Flag to track if response has been sent
      let responseHasBeenSent = false;
      
      try {
        // If the cacheMiddleware has already sent a response, don't proceed further
        if (res.headersSent) {
          responseHasBeenSent = true;
          return;
        }
        
        console.log('Executing transformation metrics query...');

        const result = await db.query.transformationLogs.findMany({
          columns: {
            type: true,
            duration_ms: true,
            created_at: true
          },
          where: sql`created_at > NOW() - INTERVAL '24 hours'`
        });

        console.log('Raw query result:', result);

        // Calculate metrics from the result array
        const metrics = {
          total_transformations: result.length,
          average_time_ms: result.reduce((acc, row) => acc + (Number(row.duration_ms) || 0), 0) / (result.length || 1),
          error_count: result.filter(row => row.type === 'error').length,
          last_updated: result.length > 0
            ? Math.max(...result.map(row => row.created_at.getTime()))
            : Date.now()
        };

        console.log('Calculated metrics:', metrics);

        const response = {
          status: 'success',
          data: {
            totalTransformations: metrics.total_transformations,
            averageTimeMs: Number(metrics.average_time_ms.toFixed(2)),
            errorRate: metrics.total_transformations > 0
              ? Number((metrics.error_count / metrics.total_transformations).toFixed(2))
              : 0,
            lastUpdated: new Date(metrics.last_updated).toISOString()
          }
        };

        console.log('Processed response:', response);
        
        // Check both responseHasBeenSent flag and res.headersSent for maximum safety
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.json(response);
        }
      } catch (error) {
        console.error('Error in transformation metrics endpoint:', {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error,
          timestamp: new Date().toISOString()
        });

        // Only send error response if no response has been sent yet (double-check)
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.status(500).json({
            status: 'error',
            message: 'Failed to fetch transformation metrics',
            details: process.env.NODE_ENV === 'development'
              ? error instanceof Error ? error.message : String(error)
              : undefined
          });
        }
      }
    }
  );
  app.get("/api/admin/export-logs",
    createRateLimiter('low'),
    async (_req, res) => {
      // Flag to track if response has been sent
      let responseHasBeenSent = false;
      
        // If headers have already been sent, don't proceed further
        if (res.headersSent) {
          responseHasBeenSent = true;
          return;
        }
      try {
        console.log('Fetching logs for export...');

        const logs = await db.query.transformationLogs.findMany({
          orderBy: (logs, { desc }) => [desc(logs.created_at)],
          limit: 1000 // Limit to last 1000 logs
        });

        console.log(`Found ${logs.length} logs to export`);

        const formattedLogs = logs.map(log => ({
          timestamp: log.created_at.toISOString(),
          type: log.type,
          message: log.message,
          duration_ms: log.duration_ms?.toString() || '',
          resolved: log.resolved ? 'Yes' : 'No',
          error_message: log.error_message || '',
          payload: log.payload ? JSON.stringify(log.payload) : ''
        }));

        // Only send response if it hasn't been sent already
        if (!responseHasBeenSent) {
          responseHasBeenSent = true;
          
          // Set headers for CSV download
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename=transformation_logs_${new Date().toISOString().split('T')[0]}.csv`);
  
          // Convert to CSV format
          const csvData = [
            // Header row
            Object.keys(formattedLogs[0] || {}).join(','),
            // Data rows
            ...formattedLogs.map(log =>
              Object.values(log)
                .map(value => `"${String(value).replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');
  
          return res.send(csvData);
        }
      } catch (error) {
        console.error('Error exporting logs:', error);
        
        // Only send error response if no response has been sent yet
        if (!responseHasBeenSent) {
          responseHasBeenSent = true;
          return res.status(500).json({
            status: 'error',
            message: 'Failed to export logs',
            details: process.env.NODE_ENV === 'development'
              ? error instanceof Error ? error.message : String(error)
              : undefined
          });
        }
      }
    }
  );
}

let wss: WebSocketServer;

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Register API routes before setupVite is called
  setupAPIRoutes(app);

  // Setup WebSocket after HTTP server is created but before Vite
  setupWebSocket(httpServer);

  return httpServer;
}

function setupWebSocket(httpServer: Server) {
  // Create WebSocket server for leaderboard updates
  createWebSocketServer(httpServer, '/ws/leaderboard', (ws, _req) => {
    handleLeaderboardConnection(ws);
  });
  
  // Create WebSocket server for transformation logs
  createWebSocketServer(httpServer, '/ws/transformation-logs', (ws, _req) => {
    handleTransformationLogsConnection(ws);
  });
  
  // Create WebSocket server for support chat
  createWebSocketServer(httpServer, '/ws/chat', (ws, _req) => {
    log("info", "New support chat WebSocket connection established");
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'chat_message') {
          // Echo the message back to the client for now
          // In a real implementation, this would store the message and broadcast to other clients
          ws.send(JSON.stringify({
            id: Date.now(),
            userId: 1, // Mock user ID
            message: data.message,
            createdAt: new Date().toISOString(),
            isStaffReply: data.isStaffReply || false
          }));
        }
      } catch (err) {
        log("error", `Error parsing chat message: ${err}`);
      }
    });
    
    ws.on('error', (error) => {
      log("error", `Chat WebSocket error: ${error.message}`);
    });
  });
}

function handleLeaderboardConnection(ws: WebSocket) {
  const clientId = Date.now().toString();
  log(`Leaderboard WebSocket client connected (${clientId})`);

  ws.isAlive = true;
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("error", (error: Error) => {
    log(`WebSocket error (${clientId}): ${error.message}`);
    clearInterval(pingInterval);
    ws.terminate();
  });

  ws.on("close", () => {
    log(`Leaderboard WebSocket client disconnected (${clientId})`);
    clearInterval(pingInterval);
  });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "CONNECTED",
      clientId,
      timestamp: Date.now()
    }));
  }
}

function handleTransformationLogsConnection(ws: WebSocket) {
  const clientId = Date.now().toString();
  log(`Transformation logs WebSocket client connected (${clientId})`);

  // Send initial connection confirmation
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "CONNECTED",
      clientId,
      timestamp: Date.now()
    }));

    // Send recent logs on connection
    db.select()
      .from(transformationLogs)
      .orderBy(sql`created_at DESC`)
      .limit(50)
      .then(logs => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "INITIAL_LOGS",
            logs: logs.map(log => ({
              ...log,
              timestamp: log.created_at.toISOString()
            }))
          }));
        }
      })
      .catch(error => {
        console.error("Error fetching initial logs:", error);
      });
  }

  // Setup ping/pong for connection health check
  ws.isAlive = true;
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("close", () => {
    clearInterval(pingInterval);
    log(`Transformation logs WebSocket client disconnected (${clientId})`);
  });

  ws.on("error", (error: Error) => {
    log(`WebSocket error (${clientId}): ${error.message}`);
    clearInterval(pingInterval);
    ws.terminate();
  });
}

export function broadcastLeaderboardUpdate(data: any) {
  broadcast('/ws/leaderboard', {
    type: "LEADERBOARD_UPDATE",
    data
  });
}

export function broadcastTransformationLog(log: {
  type: 'info' | 'error' | 'warning';
  message: string;
  data?: any;
}) {
  broadcast('/ws/transformation-logs', {
    type: "TRANSFORMATION_LOG",
    log: {
      ...log,
      timestamp: new Date().toISOString()
    }
  });
}

declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
  }
}

// Use the new cacheService instead of the old CacheManager
// const cacheManager = new CacheManager();

const batchHandler = async (req: any, res: any) => {
  try {
    const { requests } = req.body;
    if (!Array.isArray(requests)) {
      return res.status(400).json({ error: 'Invalid batch request format' });
    }

    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          const response = await fetch(
            `${API_CONFIG.baseUrl}${request.endpoint}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
                "Content-Type": "application/json",
              },
              signal: AbortSignal.timeout(60000), // 60 seconds timeout
            }
          );

          if (!response.ok) {
            throw new ApiError(`API Error: ${response.status}`, { status: response.status });
          }

          return await response.json();
        } catch (error) {
          const apiError = error as ApiError;
          return {
            status: 'error',
            error: apiError.message || 'Failed to process request',
            endpoint: request.endpoint
          };
        }
      })
    );

    res.json({
      status: 'success',
      results: results.map(result =>
        result.status === 'fulfilled' ? result.value : result.reason
      )
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Batch processing failed',
      error: (error as Error).message
    });
  }
};

const wheelSpinSchema = z.object({
  segmentIndex: z.number(),
  reward: z.string().nullable(),
});

//This function was already in the original code.
function setupRESTRoutes(app: Express) {
  // Public user profile route - no authentication required
  // User search endpoint - this must be defined BEFORE the :userId route
  app.get("/api/users/search", 
    createRateLimiter('high'),
    async (req, res) => {
      try {
        console.log("User search API called with query:", req.query);
        const query = req.query.q as string;
        
        if (!query || query.length < 2) {
          return res.status(400).json({ 
            message: "Search query must be at least 2 characters" 
          });
        }
        
        // Search for users by username or by Goated username/ID
        const searchResults = await db.execute(sql`
          SELECT
            id,
            username,
            bio,
            profile_color as "profileColor",
            created_at as "createdAt",
            goated_id as "goatedId",
            goated_username as "goatedUsername",
            goated_account_linked as "goatedAccountLinked"
          FROM users
          WHERE 
            LOWER(username) LIKE ${`%${query.toLowerCase()}%`} OR
            LOWER(goated_username) LIKE ${`%${query.toLowerCase()}%`} OR
            goated_id = ${query}
          LIMIT 10
        `);
        
        const users = searchResults.rows || [];
        
        // Enhanced response with profile type information
        const enhancedUsers = users.map(user => ({
          ...user,
          isLinked: user.goatedAccountLinked || false,
          profileType: user.goatedAccountLinked ? 'permanent' : 'standard'
        }));
        
        console.log(`Found ${enhancedUsers.length} users matching "${query}"`);
        return res.json(enhancedUsers);
      } catch (error) {
        console.error("User search error:", error);
        return res.status(500).json({ 
          message: "An error occurred while searching for users" 
        });
      }
    }
  );
  
  app.get("/api/users/:userId", 
    createRateLimiter('high'), 
    async (req, res) => {
      try {
        const userId = req.params.userId;
        if (!userId) {
          return res.status(400).json({ 
            status: "error", 
            message: "User ID is required" 
          });
        }

        console.log(`API user profile request for ID: ${userId}`);
        
        // Use our centralized ensureUserProfile function to handle all profile cases
        // This automatically ensures a profile exists (creating it if needed)
        // and returns appropriate fields
        const user = await ensureUserProfile(userId);
        
        if (!user) {
          return res.status(404).json({ 
            status: "error", 
            message: "User not found and could not be created" 
          });
        }

        // Try to get total wager from API for accurate tier calculation
        let totalWager = 0; 
        
        if (user.goatedId) {
          try {
            // Fetch the latest stats for this user
            const token = process.env.API_TOKEN || API_CONFIG.token;
            const leaderboardUrl = `https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E`;
            
            console.log(`Fetching wager data for user ${user.goatedId} from API`);
            
            const response = await fetch(leaderboardUrl, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              signal: AbortSignal.timeout(10000),
            });
            
            if (response.ok) {
              const leaderboardData = await response.json();
              console.log(`Raw API response for ${user.goatedId}:`, JSON.stringify({
                hasData: !!leaderboardData?.data,
                timeframes: leaderboardData?.data ? Object.keys(leaderboardData.data) : [],
                userFound: false // Will be updated below if found
              }));
              
              const timeframes = ['all_time', 'monthly', 'weekly', 'today'];
              
              // Search all timeframes to find this user
              for (const timeframe of timeframes) {
                const users = leaderboardData?.data?.[timeframe]?.data || [];
                const foundUser = users.find((u: any) => u.uid === user.goatedId);
                
                if (foundUser) {
                  console.log(`Found user in ${timeframe} data:`, JSON.stringify({
                    name: foundUser.name,
                    uid: foundUser.uid,
                    hasWagered: !!foundUser.wagered,
                    wageredKeys: foundUser.wagered ? Object.keys(foundUser.wagered) : []
                  }));
                  
                  if (foundUser.wagered && typeof foundUser.wagered.all_time === 'number') {
                    totalWager = foundUser.wagered.all_time;
                    console.log(`Found all_time wager for user ${user.goatedId}: ${totalWager}`);
                    break;
                  }
                }
              }
            } else {
              console.error(`Failed to fetch leaderboard data: ${response.status} ${response.statusText}`);
            }
          } catch (statsError) {
            console.error(`Error fetching wager stats for user ${userId}:`, statsError);
          }
        }
        
        // Return enhanced user profile data with totalWager for tier calculation
        const responseData = {
          id: user.id,
          username: user.username,
          bio: user.bio || "",
          profileColor: user.profileColor || "#D7FF00",
          createdAt: user.createdAt,
          goatedId: user.goatedId,
          goatedUsername: user.goatedUsername,
          isLinked: user.goatedAccountLinked || false,
          profileType: user.isPermanent ? 'permanent' : 
                      user.isTemporary ? 'temporary' : 
                      user.isCustom ? 'custom' : 'standard',
          isNewlyCreated: user.isNewlyCreated || false,
          totalWager: totalWager // Add the totalWager for tier calculations
        };
        
        console.log(`Returning profile data with totalWager: ${totalWager}`);
        res.json(responseData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ 
          status: "error", 
          message: "Failed to fetch user profile" 
        });
      }
    }
  );

  app.get("/api/admin/export-logs",
    createRateLimiter('low'),
    async (_req, res) => {
      // Flag to track if response has been sent
      let responseHasBeenSent = false;
      
      try {
        console.log('Fetching logs for export...');

        const logs = await db.query.transformationLogs.findMany({
          orderBy: (logs, { desc }) => [desc(logs.created_at)],
          limit: 1000 // Limit to last 1000 logs
        });

        console.log(`Found ${logs.length} logs to export`);

        const formattedLogs = logs.map(log => ({
          timestamp: log.created_at.toISOString(),
          type: log.type,
          message: log.message,
          duration_ms: log.duration_ms?.toString() || '',
          resolved: log.resolved ? 'Yes' : 'No',
          error_message: log.error_message || '',
          payload: log.payload ? JSON.stringify(log.payload) : ''
        }));

        // Only send response if it hasn't been sent already
        if (!responseHasBeenSent) {
          responseHasBeenSent = true;
          
          // Set headers for CSV download
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename=transformation_logs_${new Date().toISOString().split('T')[0]}.csv`);
  
          // Convert to CSV format
          const csvData = [
            // Header row
            Object.keys(formattedLogs[0] || {}).join(','),
            // Data rows
            ...formattedLogs.map(log =>
              Object.values(log)
                .map(value => `"${String(value).replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');
  
          return res.send(csvData);
        }
      } catch (error) {
        console.error('Error exporting logs:', error);
        
        // Only send error response if no response has been sent yet
        if (!responseHasBeenSent) {
          responseHasBeenSent = true;
          return res.status(500).json({
            status: 'error',
            message: 'Failed to export logs',
            details: process.env.NODE_ENV === 'development'
              ? error instanceof Error ? error.message : String(error)
              : undefined
          });
        }
      }
    }
  );
}

class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
  }
}