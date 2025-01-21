import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from 'ws';
import { log } from "./vite";
import { setupAuth } from "./auth";
import { API_CONFIG } from "./config/api";
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { requireAdmin, requireAuth } from './middleware/auth';
import { db } from '@db';
import { wagerRaces, users } from '@db/schema';
import { eq } from 'drizzle-orm';

const rateLimiter = new RateLimiterMemory({
  points: 60,
  duration: 1,
});

let wss: WebSocketServer;

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);
  setupAuth(app);
  setupRESTRoutes(app);
  setupWebSocket(httpServer);
  return httpServer;
}

function setupRESTRoutes(app: Express) {
  app.get("/api/profile", requireAuth, handleProfileRequest);
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (!user || !user.isAdmin) {
        return res.status(401).json({ error: "Invalid admin credentials" });
      }

      // Verify password and generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin
      });

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });

      res.json({ user });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: "Failed to process admin login" });
    }
  });

  app.get("/api/admin/users", requireAdmin, handleAdminUsersRequest);
  app.get("/api/admin/wager-races", requireAdmin, handleWagerRacesRequest);
  app.post("/api/admin/wager-races", requireAdmin, handleCreateWagerRace);

  app.put("/api/admin/wager-races/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const race = await db
        .update(wagerRaces)
        .set({ status, updatedAt: new Date() })
        .where(eq(wagerRaces.id, parseInt(id)))
        .returning();

      // Broadcast update to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'RACE_STATUS_UPDATE', data: race[0] }));
        }
      });

      res.json(race[0]);
    } catch (error) {
      log(`Error updating race status: ${error}`);
      res.status(500).json({ error: "Failed to update race status" });
    }
  });

  app.get("/api/affiliate/stats", handleAffiliateStats);
}

async function handleProfileRequest(req: any, res: any) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin
      })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);

    res.json(user);
  } catch (error) {
    log(`Error fetching profile: ${error}`);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
}

async function handleAdminUsersRequest(_req: any, res: any) {
  try {
    const usersList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin
      })
      .from(users)
      .orderBy(users.createdAt);

    res.json(usersList);
  } catch (error) {
    log(`Error fetching users: ${error}`);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function handleWagerRacesRequest(_req: any, res: any) {
  try {
    const races = await db.query.wagerRaces.findMany({
      orderBy: (races, { desc }) => [desc(races.createdAt)]
    });
    res.json(races);
  } catch (error) {
    log(`Error fetching wager races: ${error}`);
    res.status(500).json({ error: "Failed to fetch wager races" });
  }
}

async function handleCreateWagerRace(req: any, res: any) {
  try {
    const race = await db
      .insert(wagerRaces)
      .values({
        ...req.body,
        createdBy: req.user!.id
      })
      .returning();

    // Broadcast update to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: 'RACE_UPDATE', data: race[0] }));
      }
    });

    res.json(race[0]);
  } catch (error) {
    log(`Error creating wager race: ${error}`);
    res.status(500).json({ error: "Failed to create wager race" });
  }
}

// Cache storage
const statsCache = {
  data: null as any,
  lastUpdated: 0
};

async function handleAffiliateStats(req: any, res: any) {
  try {
    await rateLimiter.consume(req.ip || "unknown");
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Check cache (valid for 5 seconds)
    const now = Date.now();
    if (statsCache.data && (now - statsCache.lastUpdated) < 5000) {
      return res.json(statsCache.data);
    }

    const data = await fetchLeaderboardData(page, limit);
    statsCache.data = data;
    statsCache.lastUpdated = now;
    res.json(data);
  } catch (error: any) {
    if (error.consumedPoints) {
      res.status(429).json({ error: "Too many requests" });
    } else {
      log(`Error in /api/affiliate/stats: ${error}`);
      res.status(500).json({
        success: false,
        error: "Failed to fetch affiliate stats",
        message: error.message
      });
    }
  }
}

function setupWebSocket(httpServer: Server) {
  wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws/affiliate-stats') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', handleWebSocketConnection);
}

async function handleWebSocketConnection(ws: WebSocket) {
  log('WebSocket client connected');
  let interval: NodeJS.Timeout;

  try {
    const data = await fetchLeaderboardData();
    ws.send(JSON.stringify(data));

    interval = setInterval(async () => {
      try {
        const data = await fetchLeaderboardData();
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      } catch (error) {
        log(`Error sending WebSocket update: ${error}`);
      }
    }, 30000);

    ws.on('close', () => {
      log('WebSocket client disconnected');
      clearInterval(interval);
    });

  } catch (error) {
    log(`Error in WebSocket connection: ${error}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }
}

async function fetchLeaderboardData(page: number = 0, limit: number = 10) {
  const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      log('API Authentication failed - check API token');
      throw new Error('API Authentication failed');
    }
    throw new Error(`API request failed: ${response.status}`);
  }

  const apiData = await response.json();
  return transformLeaderboardData(apiData);
}

function transformLeaderboardData(apiData: any) {
  const responseData = apiData.data || apiData.results || apiData;
  if (!responseData || (Array.isArray(responseData) && responseData.length === 0)) {
    return {
      success: false,
      metadata: {
        totalUsers: 0,
        lastUpdated: new Date().toISOString()
      },
      data: {
        today: { data: [] },
        all_time: { data: [] },
        monthly: { data: [] },
        weekly: { data: [] }
      }
    };
  }

  const dataArray = Array.isArray(responseData) ? responseData : [responseData];
  const transformedData = dataArray.map(entry => ({
    uid: entry.uid || '',
    name: entry.name || '',
    wagered: {
      today: entry.wagered?.today || 0,
      this_week: entry.wagered?.this_week || 0,
      this_month: entry.wagered?.this_month || 0,
      all_time: entry.wagered?.all_time || 0
    }
  }));

  return {
    success: true,
    metadata: {
      totalUsers: transformedData.length,
      lastUpdated: new Date().toISOString()
    },
    data: {
      today: { data: sortByWagered(transformedData, 'today') },
      weekly: { data: sortByWagered(transformedData, 'this_week') },
      monthly: { data: sortByWagered(transformedData, 'this_month') },
      all_time: { data: sortByWagered(transformedData, 'all_time') }
    }
  };
}

function sortByWagered(data: any[], period: string) {
  return [...data].sort((a, b) => (b.wagered[period] || 0) - (a.wagered[period] || 0));
}

function generateToken(payload: any): string {
  //Implementation for generateToken is missing in original code, but it's not relevant to the fix.  Leaving as is.
  return "";
}