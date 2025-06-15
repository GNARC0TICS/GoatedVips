import 'dotenv/config';

/**
 * Main server entry point for the GoatedVIPs application
 * Handles server initialization, middleware setup, and core service bootstrapping
 * 
 * Core responsibilities:
 * - Server configuration and startup
 * - Middleware integration
 * - Database connection
 * - WebSocket setup
 * - Route registration
 * - Error handling
 * 
 * @module server/index
 */

// Core dependencies
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { WebSocket } from "ws";
import { createWebSocketServer, closeAllWebSocketServers } from "./config/websocket";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { promisify } from "util";
import { exec } from "child_process";
import { sql, eq } from "drizzle-orm";
import compression from "compression";
// import schedule from "node-schedule";
import profileService from "./services/profileService";
import { startLeaderboardSyncScheduler } from "./services/leaderboardSyncService";

// Application modules
import { log } from "./utils/logger";
import { registerRoutes } from "./routes";
import { domainRedirectMiddleware } from "./middleware/domain-handler";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { db } from "../db";
import { setupAuth } from "./auth";
import { API_CONFIG } from "./config/api";
import { users } from "../db/schema";

// Configuration modules
import { PATHS } from "./config/paths";
import { ENV } from "./config/environment";

// Middleware
import cors from "cors";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Convert callback-based exec to Promise-based for cleaner async/await usage
const execAsync = promisify(exec);

// ES Modules compatible dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment configuration instead of hard-coded values
const { PORT, HOST, IS_DEVELOPMENT, IS_PRODUCTION, CORS_ORIGINS, SESSION_SECRET, COOKIE_SECURE, COOKIE_MAX_AGE, API_TOKEN, GOATED_API_TOKEN, DATABASE_URL } = ENV;

// Global server state management
let templateCache: string | null = null;  // Caches HTML template for better performance
let server: any = null;                   // HTTP server instance

/**
 * Checks if a specified port is available for use
 * Used during server initialization to ensure clean startup
 * 
 * @param port - The port number to check
 * @returns Promise<boolean> - True if port is available, false otherwise
 */
async function isPortAvailable(port: number): Promise<boolean> {
  try {
    await execAsync(`lsof -i:${port}`);
    return false;
  } catch {
    return true;
  }
}

/**
 * Waits for a port to become available with timeout
 * Ensures clean server startup by waiting for port availability
 * 
 * @param port - Port number to wait for
 * @param timeout - Maximum time to wait in milliseconds
 * @throws Error if timeout is reached before port becomes available
 */
async function waitForPort(port: number, timeout = 30000): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      return;
    }
    log("info", `Port ${port} is in use, waiting...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Timeout waiting for port ${port}`);
}

/**
 * Tests database connectivity
 * Critical startup check to ensure database is accessible
 * Exits process if connection fails
 */
async function testDbConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

/**
 * Creates or retrieves a profile for a specific user ID
 * Used by endpoints to ensure a user profile exists before showing data
 * 
 * This function handles the following scenarios:
 * 1. Finding existing users by their internal database ID
 * 2. Finding existing users by their Goated ID
 * 3. Creating new permanent profiles for users found in the Goated.com leaderboard API
 * 4. Creating temporary placeholder profiles for users not found in the API
 * 
 * @param userId - The user ID (numeric internal ID or external Goated ID)
 * @returns User object with isNewlyCreated flag if found/created, null otherwise 
 */
export async function ensureUserProfile(userId: string): Promise<any> {
  if (!userId) return null;

  console.log(`Ensuring profile exists for ID: ${userId}`);

  try {
    // First check if this is a numeric ID in our database
    const isNumericId = /^\d+$/.test(userId);
    let existingUser = null;

    // First check if user already exists in our database
    try {
      // Try to find by direct ID match first with full profile data
      const results = await db.execute(sql`
        SELECT 
          id, 
          username, 
          bio,
          email,
          profile_color as "profileColor",
          created_at as "createdAt",
          goated_id as "goatedId", 
          goated_username as "goatedUsername",
          goated_account_linked as "goatedAccountLinked"
        FROM users WHERE id::text = ${userId} LIMIT 1
      `);

      existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;

      if (existingUser) {
        // Add a flag to indicate this was an existing user
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }
    } catch (findError) {
      console.log("Error finding user by string ID:", findError);
      existingUser = null;
    }

    // If not found by direct ID, check if it's a goatedId
    try {
      const results = await db.execute(sql`
        SELECT 
          id, 
          username, 
          bio,
          email,
          profile_color as "profileColor",
          created_at as "createdAt",
          goated_id as "goatedId", 
          goated_username as "goatedUsername",
          goated_account_linked as "goatedAccountLinked"
        FROM users WHERE goated_id = ${userId} LIMIT 1
      `);

      existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;

      if (existingUser) {
        // Add a flag to indicate this was an existing user
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }
    } catch (findError) {
      console.log("Error finding user by Goated ID:", findError);
    }

    // No existing user, try to fetch user data from the leaderboard API if it's numeric (potential Goated ID)
    if (isNumericId) {
      const token = GOATED_API_TOKEN || API_TOKEN || API_CONFIG.token;

      // Try to fetch user data from the leaderboard API
      let userData = null;

      if (token) {
        try {
          // Fetch leaderboard data which contains all users
          const leaderboardUrl = `https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E`;
          console.log(`Fetching leaderboard data to find user ${userId}`);

          const response = await fetch(leaderboardUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(15000), // Add timeout to prevent hanging requests
          });

          if (response.ok) {
            const leaderboardData = await response.json();

            // Search for the user in different time periods
            const timeframes = ['today', 'weekly', 'monthly', 'all_time'];

            // Look through all timeframes to find the user
            for (const timeframe of timeframes) {
              const users = leaderboardData?.data?.[timeframe]?.data || [];

              // Find the user with the matching UID
              const foundUser = users.find((user: any) => user.uid === userId);

              if (foundUser) {
                userData = foundUser;
                console.log("Successfully found user in leaderboard data:", userData);
                break;
              }
            }

            if (!userData) {
              console.log(`User ID ${userId} not found in any leaderboard timeframe`);
            }
          } else {
            console.log(`Failed to fetch leaderboard data: ${response.status}`);
          }
        } catch (apiError) {
          console.error("Error fetching from leaderboard API:", apiError);
        }
      }

      // Attempt to retrieve the actual username from the Goated API data
      const username = userData?.name || null;

      if (userData && username) {
        // We have valid data from the API, create a permanent profile for this Goated user
        try {
          const newUserId = Math.floor(1000 + Math.random() * 9000);
          const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;

          // Create a more complete profile with the real data from Goated
          const result = await db.execute(sql`
            INSERT INTO users (
              username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_username, goated_account_linked
            ) VALUES (
              ${username}, ${email}, '', ${new Date()}, '#D7FF00', 
              'Official Goated.com player profile', false, ${userId}, ${username}, true
            ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
              goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
          `);

          if (result && result.rows && result.rows.length > 0) {
            console.log(`Created permanent profile for Goated player ${username} (${userId})`);
            return {
              ...result.rows[0],
              isNewlyCreated: true,
              isPermanent: true
            };
          }
        } catch (insertError) {
          console.error(`Failed to create permanent user profile for Goated ID ${userId}:`, insertError);
        }
      } else {
        // No user data found in leaderboard, create a temporary placeholder profile
        try {
          const newUserId = Math.floor(1000 + Math.random() * 9000);
          // Use a more neutral username format that doesn't imply verification
          const tempUsername = `User ${userId}`;
          const email = `user_${userId}@placeholder.com`;

          // Create a placeholder profile with clear indication this is temporary
          const result = await db.execute(sql`
            INSERT INTO users (
              username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_account_linked
            ) VALUES (
              ${tempUsername}, ${email}, '', ${new Date()}, '#D7FF00', 
              'User profile', false, ${userId}, false
            ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
              goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
          `);

          if (result && result.rows && result.rows.length > 0) {
            console.log(`Created temporary profile for unknown Goated ID ${userId}`);
            return {
              ...result.rows[0],
              isNewlyCreated: true,
              isTemporary: true
            };
          }
        } catch (insertError) {
          console.error(`Failed to create temporary user profile for ID ${userId}:`, insertError);
        }
      }
    } else {
      // Handle non-numeric IDs (like UUIDs or custom strings)
      try {
        const shortId = userId.substring(0, 8); // Use first 8 chars of UUID/string
        const newUserId = Math.floor(1000 + Math.random() * 9000);
        const username = `User ${shortId}`;
        const email = `user_${shortId}@placeholder.com`;

        // Clear indication this is a non-Goated profile
        const result = await db.execute(sql`
          INSERT INTO users (
            username, email, password, created_at, profile_color, 
            bio, is_admin, goated_id, goated_account_linked
          ) VALUES (
            ${username}, ${email}, '', ${new Date()}, '#D7FF00', 
            'User profile', false, ${userId}, false
          ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
            goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
        `);

        if (result && result.rows && result.rows.length > 0) {
          console.log(`Created custom profile for non-numeric ID ${shortId}`);
          return {
            ...result.rows[0],
            isNewlyCreated: true,
            isCustom: true
          };
        }
      } catch (insertError) {
        console.error(`Failed to create custom profile for ID ${userId}:`, insertError);
      }
    }

    return null;
  } catch (error) {
    console.error(`Error ensuring profile for ID ${userId}:`, error);
    return null;
  }
}

/**
 * Sync user profiles from leaderboard data
 * Uses the profileService to handle user profile synchronization
 */
async function syncUserProfiles() {
  try {
    console.log("Running scheduled profile sync...");

    // Using profileService directly to sync profiles
    const result = await profileService.syncUserProfiles();

    console.log(`Profile sync completed:`, result);
  } catch (error) {
    console.error("Error in scheduled profile sync:", error);
  }
}

/**
 * Main server initialization function
 * Orchestrates the complete server setup process including:
 * - Port availability check
 * - Database connection
 * - Express app setup
 * - Middleware configuration
 * - Route registration
 * - Admin initialization
 * - WebSocket setup
 */
async function initializeServer() {
  try {
    log("info", "Starting server initialization...");

    await waitForPort(PORT);
    log("info", "Port available, proceeding with initialization");

    await testDbConnection();
    log("info", "Database connection established");

    // Start background sync operations (non-blocking)
    console.log("Starting optimized background data sync...");
    
    // Run initial profile sync
    profileService.syncUserProfiles()
      .then(stats => {
        console.log("Initial profile sync completed:", stats);
      })
      .catch(error => {
        console.error("Initial profile sync failed:", error);
      });

    // Start optimized leaderboard sync scheduler (10-minute intervals)
    startLeaderboardSyncScheduler();

    const app = express();
    setupMiddleware(app);
    setupAuth(app);
    registerRoutes(app);

    server = createServer(app);
    setupWebSocket(server);

    // Setup development or production server based on environment
    if (IS_DEVELOPMENT) {
      await setupVite(app, server);
    } else {
      serveStatic(app);

      // Add error handling after routes are registered
      // 404 handler only for API routes in production mode
      app.use('/api', notFoundHandler);
    }

    // Global error handler as the last middleware
    app.use(errorHandler);

    // Admin routes are set up through the middleware and routes system
    log("info", "Admin routes initialized");

    // Start server and handle graceful shutdown
    return new Promise((resolve, reject) => {
      server.listen(PORT, HOST, () => {
        log("info", `Server is ready at http://0.0.0.0:${PORT}`);
        console.log(`PORT=${PORT}`);
        console.log(`PORT_READY=${PORT}`);
        resolve(server);
      }).on("error", (err: Error) => {
        log("error", `Server failed to start: ${err.message}`);
        reject(err);
      });

      // Graceful shutdown handler
      const shutdown = async () => {
        log("info", "Shutting down gracefully...");

        // Close all WebSocket servers
        closeAllWebSocketServers();
        log("info", "All WebSocket servers closed");

        // Close HTTP server
        server.close(() => {
          log("info", "HTTP server closed");
          process.exit(0);
        });

        // Force exit if graceful shutdown fails
        setTimeout(() => {
          log("error", "Forced shutdown after timeout");
          process.exit(1);
        }, 10000);
      };

      // Register shutdown handlers for clean process termination
      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    });
  } catch (error) {
    log("error", `Failed to start application: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

/**
 * Sets up WebSocket server for real-time communication
 * Uses the centralized WebSocket configuration module
 * 
 * @param server - HTTP server instance to attach WebSocket server to
 */
function setupWebSocket(server: any) {
  // Create a general purpose WebSocket server
  createWebSocketServer(server, '/ws', (ws, _req) => {
    log("info", "New WebSocket connection established");

    ws.on('error', (error) => {
      log("error", `WebSocket error: ${error.message}`);
    });
  });
}

/**
 * Configures Express middleware stack
 * Sets up core middleware for request handling, security, and session management
 * 
 * @param app - Express application instance
 */
function setupMiddleware(app: express.Application) {
  app.set('trust proxy', 1);

  // Domain detection middleware (important to run first)
  app.use(domainRedirectMiddleware);

  // CORS configuration for API routes
  app.use('/api', cors({
    origin: CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
  }));

  // Session store configuration using PostgreSQL
  const PostgresSessionStore = connectPg(session);
  app.use(session({
    store: new PostgresSessionStore({
      conObject: {
        connectionString: DATABASE_URL,
      },
      createTableIfMissing: true,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: COOKIE_SECURE,
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE,
    },
  }));

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Body parsing middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestLogger);

  // Response compression
  app.use(compression());
}

/**
 * Request logging middleware with batched logging
 * Improves performance by batching log writes
 */
const requestLogger = (() => {
  const logQueue: string[] = [];
  let flushTimeout: NodeJS.Timeout | null = null;

  const flushLogs = () => {
    if (logQueue.length > 0) {
      console.log(logQueue.join('\n'));
      logQueue.length = 0;
    }
    flushTimeout = null;
  };

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        const duration = Date.now() - start;
        logQueue.push(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        if (!flushTimeout) {
          flushTimeout = setTimeout(flushLogs, 1000);
        }
      }
    });
    next();
  };
})();

/**
 * Serves static files in production mode
 * Handles static asset serving and SPA fallback
 * 
 * @param app - Express application instance
 */
function serveStatic(app: express.Application) {
  const distPath = PATHS.clientBuild;

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}. Please build the client first.`);
  }

  // Static file serving with improved caching strategy
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Apply appropriate cache headers based on file type
      if (filePath.match(/\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        // Asset files can be cached longer
        if (filePath.match(/\.[a-f0-9]{8}\.(?:js|css)$/)) {
          // Hashed assets can be cached for longer (1 year)
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else {
          // Regular assets get a day of caching
          res.setHeader('Cache-Control', 'public, max-age=86400');
        }
      } else {
        // HTML and other files should not be cached
        res.setHeader('Cache-Control', 'no-cache');
      }
      // Add security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
    etag: true,
    lastModified: true
  }));

  // SPA fallback
  app.get("*", (_req, res, next) => {
    if (_req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  });
}

// Vite development server configuration
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const viteConfig = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "../db"),
      "@": path.resolve(__dirname, "../client/src"),
    },
  },
  root: path.resolve(__dirname, "../client"),
  build: {
    outDir: path.resolve(__dirname, "../dist/public"),
    emptyOutDir: true,
  },
});

/**
 * Sets up Vite development server
 * Configures Vite for development mode with HMR
 * 
 * @param app - Express application instance
 * @param server - HTTP server instance
 */
async function setupVite(app: express.Application, server: any) {
  const viteLogger = createLogger();
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  });

  app.use(vite.middlewares);

  // Template loading with caching
  const loadTemplate = async () => {
    if (!templateCache) {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
      templateCache = await fs.promises.readFile(clientTemplate, "utf-8");
    }
    return templateCache;
  };

  // Serve Vite-processed HTML
  app.use("*", async (req, res, next) => {
    try {
      let template = await loadTemplate();
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${Date.now()}"`);
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff"
      }).end(page);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

import { telegramBotService } from './services/telegramBotService';

// Initialize server
initializeServer().catch((error) => {
  log("error", `Server startup error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});