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
    // Skip API and WebSocket routes
    if (req.originalUrl.startsWith('/api') || 
        req.originalUrl.startsWith('/ws') || 
        req.originalUrl.includes('.')) {
      return next();
    }

    try {
      // Determine which HTML file to serve based on domain (This assumes req.isAdminDomain is defined elsewhere)
      const isAdmin = req.isAdminDomain;
      const htmlPath = isAdmin ? PATHS.ADMIN_HTML : PATHS.INDEX_HTML; // Assumes PATHS.ADMIN_HTML and PATHS.INDEX_HTML are defined elsewhere

      // Serve the appropriate HTML with Vite transformations
      let html = await fs.promises.readFile(htmlPath, 'utf-8');


      if (vite) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      const error = e as Error;
      vite?.ssrFixStacktrace(error);
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