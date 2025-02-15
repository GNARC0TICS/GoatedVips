import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { log } from "./vite";
import { API_CONFIG } from "./config/api";
import { RateLimiterMemory, type RateLimiterRes } from "rate-limiter-flexible";
import bonusChallengesRouter from "./routes/bonus-challenges";
import { db } from "@db";
import { wagerRaces, users, transformationLogs } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { transformLeaderboardData as transformData } from "./utils/leaderboard";
import type { SelectUser } from "@db/schema";
import { initializeBot } from "./telegram/bot";

function transformRawLeaderboardData(rawData: any[]) {
  if (!Array.isArray(rawData)) {
    rawData = [];
  }

  const todayData = [...rawData].sort((a, b) => (b.wagered.today || 0) - (a.wagered.today || 0));
  const weeklyData = [...rawData].sort((a, b) => (b.wagered.this_week || 0) - (a.wagered.this_week || 0));
  const monthlyData = [...rawData].sort((a, b) => (b.wagered.this_month || 0) - (a.wagered.this_month || 0));
  const allTimeData = [...rawData].sort((a, b) => (b.wagered.all_time || 0) - (a.wagered.all_time || 0));

  return {
    status: "success",
    metadata: {
      totalUsers: rawData.length,
      lastUpdated: new Date().toISOString(),
    },
    data: {
      today: { data: todayData },
      weekly: { data: weeklyData },
      monthly: { data: monthlyData },
      all_time: { data: allTimeData },
    },
  };
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

class CacheManager {
  private cache: Map<string, { data: any; timestamp: number }>;
  private readonly defaultTTL: number;

  constructor(defaultTTL = 30000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  generateKey(req: any): string {
    return `${req.method}-${req.originalUrl}-${JSON.stringify(req.query)}`;
  }

  get(key: string): any {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

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

const cacheManager = new CacheManager();

const cacheMiddleware = (ttl = 30000) => async (req: any, res: any, next: any) => {
  const key = cacheManager.generateKey(req);
  const cachedResponse = cacheManager.get(key);

  if (cachedResponse) {
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl/1000)}`);
    return res.json(cachedResponse);
  }

  res.setHeader('X-Cache', 'MISS');
  res.setHeader('Cache-Control', 'no-cache');
  const originalJson = res.json;
  res.json = (body: any) => {
    cacheManager.set(key, body);
    res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl/1000)}`);
    return originalJson.call(res, body);
  };
  next();
};

const createRateLimiter = (tier: keyof typeof rateLimiters) => {
  const limiter = rateLimiters[tier];
  return async (req: any, res: any, next: any) => {
    try {
      const rateLimitRes = await limiter.consume(req.ip);

      res.setHeader('X-RateLimit-Limit', rateLimits[tier.toUpperCase() as RateLimitTier].points);
      res.setHeader('X-RateLimit-Remaining', rateLimitRes.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString());

      log(`Rate limit - ${tier}: ${rateLimitRes.remainingPoints} requests remaining`);
      next();
    } catch (rejRes) {
      const rejection = rejRes as RateLimiterRes;
      log(`Rate limit exceeded - ${tier}: IP ${req.ip}`);

      res.setHeader('Retry-After', Math.ceil(rejection.msBeforeNext / 1000));
      res.setHeader('X-RateLimit-Limit', rateLimits[tier.toUpperCase() as RateLimitTier].points);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rejection.msBeforeNext).toISOString());

      res.status(429).json({
        status: 'error',
        message: 'Too many requests',
        retryAfter: Math.ceil(rejection.msBeforeNext / 1000)
      });
    }
  };
};

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

function setupRESTRoutes(app: Express) {
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy" });
  });

  app.use("/api", bonusChallengesRouter);

  app.post("/api/batch", createRateLimiter('medium'), batchHandler);

  app.get("/api/wager-races/current",
    createRateLimiter('high'),
    cacheMiddleware(15000),
    async (_req, res) => {
      try {
        console.log('Fetching current race data...');
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.log('API response not ok, returning default race data');
          return res.json({
            id: new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, '0'),
            status: 'live',
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString(),
            prizePool: 500,
            participants: []
          });
        }

        const rawData = await response.json();
        console.log('Raw data received:', {
          hasData: Boolean(rawData),
          structure: rawData ? Object.keys(rawData) : null
        });

        const stats = await transformLeaderboardData(rawData);
        console.log('Transformed stats:', {
          hasMonthlyData: Boolean(stats?.data?.monthly?.data),
          monthlyDataLength: stats?.data?.monthly?.data?.length ?? 0
        });

        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        // Ensure we have a valid stats object with monthly data
        const monthlyData = stats?.data?.monthly?.data ?? [];

        const raceData = {
          id: `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`,
          status: 'live',
          startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
          endDate: endOfMonth.toISOString(),
          prizePool: 500,
          participants: monthlyData
            .map((participant: any, index: number) => ({
              uid: participant?.uid ?? "",
              name: participant?.name ?? "Unknown",
              wagered: Number(participant?.wagered?.this_month ?? 0),
              position: index + 1
            }))
            .slice(0, 10)
        };

        console.log('Sending race data:', {
          participantsCount: raceData.participants.length,
          startDate: raceData.startDate,
          endDate: raceData.endDate
        });

        res.json(raceData);
      } catch (error) {
        console.error('Error in /api/wager-races/current:', error);
        // Return a safe default response
        res.status(200).json({
          id: new Date().getFullYear() + (new Date().getMonth() + 1).toString().padStart(2, '0'),
          status: 'live',
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59).toISOString(),
          prizePool: 500,
          participants: []
        });
      }
    }
  );

  app.get("/api/affiliate/stats",
    createRateLimiter('medium'),
    cacheMiddleware(60000),
    async (req, res) => {
      try {
        const username = typeof req.query.username === 'string' ? req.query.username : undefined;
        let url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}?raw=true`;

        if (username) {
          url += `&username=${encodeURIComponent(username)}`;
        }

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            log("API Authentication failed - check API token");
            throw new ApiError("API Authentication failed", { status: 401 });
          }
          throw new ApiError(`API request failed: ${response.status}`, { status: response.status });
        }

        const rawData = await response.json();
        const transformedData = transformRawLeaderboardData(rawData);
        res.json(transformedData);
      } catch (error) {
        log(`Error in /api/affiliate/stats: ${error}`);
        res.json({
          status: "success",
          metadata: {
            totalUsers: 0,
            lastUpdated: new Date().toISOString(),
          },
          data: {
            today: { data: [] },
            weekly: { data: [] },
            monthly: { data: [] },
            all_time: { data: [] },
          },
        });
      }
    }
  );

  app.get("/api/admin/analytics",
    createRateLimiter('low'),
    cacheMiddleware(300000),
    async (_req, res) => {
      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new ApiError(`API request failed: ${response.status}`, { status: response.status });
        }

        const rawData = await response.json();
        const data = rawData.data || rawData.results || rawData;

        const totals = data.reduce((acc: any, entry: any) => {
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
          wagerTotals: totals
        };

        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
      }
    }
  );

  app.get("/api/telegram/status",
    createRateLimiter('medium'),
    async (_req, res) => {
      try {
        const bot = await initializeBot();
        if (!bot) {
          return res.status(500).json({
            status: "error",
            message: "Bot not initialized"
          });
        }

        const botInfo = await bot.getMe();
        res.json({
          status: "healthy",
          username: botInfo.username,
          timestamp: new Date().toISOString(),
          mode: "polling"
        });
      } catch (error) {
        log(`Error checking bot status: ${error}`);
        res.status(500).json({
          status: "error",
          message: "Failed to check bot status"
        });
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
  app.get("/api/admin/transformation-metrics",
    createRateLimiter('medium'),
    cacheMiddleware(30000),
    async (_req, res) => {
      try {
        interface TransformationMetrics {
          totalTransformations: number;
          averageTimeMs: number;
          errorCount: number;
          lastUpdated: Date;
        }

        const [metrics] = await db.select({
          totalTransformations: sql<number>`COUNT(*)::int`,
          averageTimeMs: sql<number>`AVG(duration_ms)::float`,
          errorCount: sql<number>`SUM(CASE WHEN type = 'error' THEN 1 ELSE 0 END)::int`,
          lastUpdated: sql<Date>`MAX(created_at)::timestamptz`
        })
          .from(transformationLogs)
          .where(sql`created_at > NOW() - INTERVAL '24 hours'`);

        const errorRate = metrics.errorCount / (metrics.totalTransformations || 1);

        res.json({
          totalTransformations: metrics.totalTransformations || 0,
          averageTimeMs: metrics.averageTimeMs || 0,
          errorRate,
          lastUpdated: metrics.lastUpdated?.toISOString() || new Date().toISOString()
        });
      } catch (error) {
        console.error('Error fetching transformation metrics:', error);
        res.status(500).json({
          status: "error",
          message: "Failed to fetch transformation metrics"
        });
      }
    }
  );
}

let wss: WebSocketServer;

function sortByWagered(data: any[], period: string) {
  return [...data].sort(
    (a, b) => (b.wagered[period] || 0) - (a.wagered[period] || 0)
  );
}

export function transformLeaderboardData(apiData: any) {
  return transformData(apiData);
}

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  setupRESTRoutes(app);
  setupWebSocket(httpServer);
  return httpServer;
}

function setupWebSocket(httpServer: Server) {
  wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (request, socket, head) => {
    if (request.headers["sec-websocket-protocol"] === "vite-hmr") {
      return;
    }

    if (request.url === "/ws/leaderboard") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
        handleLeaderboardConnection(ws);
      });
    }

    if (request.url === "/ws/transformation-logs") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
        handleTransformationLogsConnection(ws);
      });
    }
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
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "LEADERBOARD_UPDATE",
        data
      }));
    }
  });
}

export function broadcastTransformationLog(log: {
  type: 'info' | 'error' | 'warning';
  message: string;
  data?: any;
}) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: "TRANSFORMATION_LOG",
        log: {
          ...log,
          timestamp: new Date().toISOString()
        }
      }));
    }
  });
}

declare module 'ws' {
  interface WebSocket {
    isAlive?: boolean;
  }
}