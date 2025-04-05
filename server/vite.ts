import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        console.error("Vite server error, attempting to recover...");
        // Don't exit on error for better development experience
      },
    },
    server: {
      middlewareMode: true,
      hmr: { 
        server,
        clientPort: 443, // For Replit's HTTPS forwarding
        host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : undefined,
      },
      watch: {
        usePolling: true, // Better for containerized environments like Replit
        interval: 1000,
      },
      // Allow all Replit hosts automatically
      allowedHosts: ['localhost', '0.0.0.0', '.replit.dev', '.replit.app', '.repl.co', '.spock.replit.dev'],
    },
    appType: "custom",
  });

  // Use Vite's middlewares (handles static assets, HMR, etc.)
  app.use(vite.middlewares);

  // HTML handling middleware with proper caching
  app.use("*", async (req, res, next) => {
    // Skip API and WebSocket routes
    if (req.originalUrl.startsWith('/api') || 
        req.originalUrl.startsWith('/ws') || 
        req.originalUrl.endsWith('.js') ||
        req.originalUrl.endsWith('.css') ||
        req.originalUrl.endsWith('.svg') ||
        req.originalUrl.endsWith('.png') ||
        req.originalUrl.endsWith('.jpg') ||
        req.originalUrl.endsWith('.jpeg') ||
        req.originalUrl.endsWith('.gif')) {
      return next();
    }

    try {
      // Determine which HTML file to serve based on domain
      const isAdmin = req.isAdminDomain;
      const htmlPath = isAdmin 
        ? path.resolve(__dirname, "..", "client", "admin.html")
        : path.resolve(__dirname, "..", "client", "index.html");

      // Serve the appropriate HTML with Vite transformations
      let html = await fs.promises.readFile(htmlPath, 'utf-8');

      if (vite) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      res.status(200).set({ 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }).end(html);
    } catch (e) {
      const error = e as Error;
      vite?.ssrFixStacktrace(error);
      log("Vite HTML transform error:", error.message);
      next(error);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// Placeholder for PATHS and req.isAdminDomain -  These need to be defined and implemented elsewhere in the application.
const PATHS = {
  INDEX_HTML: path.resolve(__dirname, "..", "client", "index.html"),
  ADMIN_HTML: path.resolve(__dirname, "..", "admin", "index.html"), //Example path, adjust as needed.
};

declare module 'express' {
    interface Request {
      isAdminDomain: boolean;
    }
}