import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { promisify } from "util";
import { exec } from "child_process";
import { sql } from "drizzle-orm";
import { log } from "./telegram/utils/logger";
import { bot } from "./telegram/bot";
import { registerRoutes } from "./routes";
import { initializeAdmin } from "./middleware/admin";
import db from "../db";

const execAsync = promisify(exec);
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const viteConfig = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true,
  },
});

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

  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");

      const timestamp = Date.now();
      template = template.replace(
        'src="/src/main.tsx"',
        `src="/src/main.tsx?t=${timestamp}"`
      );

      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({
        "Content-Type": "text/html",
        "Cache-Control": "no-store, must-revalidate"
      }).end(page);
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}

async function serveStatic(app: express.Application) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}. Please build the client first.`);
  }

  app.use(express.static(distPath, {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }));

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'), {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  });
}

async function checkDatabaseConnection() {
  try {
    await db.execute(sql`SELECT 1`);
    log("Database connection established successfully");
  } catch (error: any) {
    log(`Database connection error: ${error.message}`);
    throw error;
  }
}

async function cleanupPort() {
  try {
    await execAsync(`lsof -ti:${PORT} | xargs kill -9`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    log(`No existing process found on port ${PORT}`);
  }
}

async function setupMiddleware(app: express.Application) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(errorHandler);

  app.get("/api/health", (_req, res) => {
    res.set('Cache-Control', 'no-store').json({ status: "healthy" });
  });
}

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
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      res.locals.body = body;
      return originalJson(body);
    };

    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        const duration = Date.now() - start;
        let logMessage = `${req.method} ${req.path} ${res.statusCode} in ${duration}ms`;
        if (res.locals.body) {
          logMessage += ` :: ${JSON.stringify(res.locals.body)}`;
        }

        logQueue.push(logMessage);
        if (!flushTimeout) {
          flushTimeout = setTimeout(flushLogs, 1000);
        }
      }
    });

    next();
  };
})();

function errorHandler(err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  console.error("Server error:", err);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
}

async function startServer() {
  try {
    log("Starting server initialization...");
    await checkDatabaseConnection();
    await cleanupPort();

    const app = express();
    app.set('trust proxy', 1);

    await setupMiddleware(app);
    registerRoutes(app);
    await initializeAdmin().catch(console.error);

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN must be provided");
    }
    log("Initializing Telegram bot...");

    const server = createServer(app);

    // Use Vite middleware in development; otherwise, serve static files
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
      log("Development server configured with Vite");
    } else {
      await serveStatic(app);
      log("Production server configured with static file serving");
    }

    return new Promise((resolve, reject) => {
      server
        .listen(PORT, "0.0.0.0")
        .once("listening", () => {
          log(`Server running on port ${PORT} (http://0.0.0.0:${PORT})`);
          log("Telegram bot started successfully");
          resolve(server);
        })
        .once("error", (error: Error) => {
          console.error("Failed to start server:", error);
          reject(error);
        });
    });

  } catch (error) {
    console.error("Failed to start application:", error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on("SIGTERM", async () => {
  log("Received SIGTERM signal. Shutting down gracefully...");
  await bot.stopPolling();
  process.exit(0);
});

process.on("SIGINT", async () => {
  log("Received SIGINT signal. Shutting down gracefully...");
  await bot.stopPolling();
  process.exit(0);
});

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});