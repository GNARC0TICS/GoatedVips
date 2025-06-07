var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config/api.ts
var API_CONFIG, INTERNAL_API_CONFIG;
var init_api = __esm({
  "server/config/api.ts"() {
    "use strict";
    API_CONFIG = {
      // The full URL to the new external API endpoint
      baseUrl: "https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E",
      // API token for authentication - hardcoded for testing
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJ3SmlGVk1yaHJEMFYiLCJpYXQiOjE3NDkyNTUxNDYsImV4cCI6MTc0OTM0MTU0Nn0.mcW1J0iakuZ-p5W54Pi5wGlFldGQcMAtm-jXXtWuY-E",
      // Empty endpoints object as we're using the full URL as baseUrl
      endpoints: {
        leaderboard: "",
        // Empty string as we're using the full URL as baseUrl
        health: ""
        // Empty string for consistency
      },
      // Request configuration
      request: {
        // Extended timeout to allow for very slow API responses (60 seconds)
        timeout: 6e4,
        // Increased number of retries for failed requests
        retries: 5
      }
    };
    INTERNAL_API_CONFIG = {
      // Rate limiting configuration
      rateLimit: {
        windowMs: 15 * 60 * 1e3,
        // 15 minutes
        max: 100,
        // limit each IP to 100 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false
      },
      // Response defaults
      response: {
        // Default pagination settings
        pagination: {
          defaultLimit: 20,
          maxLimit: 100
        }
      }
    };
  }
});

// server/services/goatedApiService.ts
var goatedApiService_exports = {};
__export(goatedApiService_exports, {
  GoatedApiService: () => GoatedApiService,
  default: () => goatedApiService_default
});
function getSleepTime(retryCount, initialDelay = 1e3, maxDelay = 6e4) {
  const delay = Math.min(maxDelay, initialDelay * Math.pow(2, retryCount));
  return delay * (0.8 + 0.4 * Math.random());
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
var GoatedApiService, goatedApiService_default;
var init_goatedApiService = __esm({
  "server/services/goatedApiService.ts"() {
    "use strict";
    init_api();
    GoatedApiService = class {
      /**
       * Initialize the service with configuration from API_CONFIG
       */
      constructor() {
        this.lastSuccessfulResponse = null;
        this.lastFetchTime = 0;
        this.apiUrl = API_CONFIG.baseUrl;
        this.apiToken = process.env.GOATED_API_TOKEN || process.env.API_TOKEN || API_CONFIG.token;
        this.requestTimeout = API_CONFIG.request.timeout;
        this.maxRetries = API_CONFIG.request.retries;
        console.log(`GoatedApiService initialized with URL: ${this.apiUrl}`);
        const hasToken = !!this.apiToken;
        console.log(`API token is ${hasToken ? "available" : "NOT available"}`);
      }
      /**
       * Fetches data from the Goated.com API
       * This is the main method that should be called by other services
       * 
       * @param forceFresh If true, forces a fresh API request even if recently cached
       * @returns Raw JSON data from the API
       */
      async fetchReferralData(forceFresh = false) {
        console.log("Fetching referral data from external API");
        if (!this.hasApiToken()) {
          throw new Error("API token is not configured");
        }
        try {
          const data = await this.makeApiRequest(forceFresh);
          return data;
        } catch (error) {
          console.error("Failed to fetch referral data:", error);
          throw error;
        }
      }
      /**
       * Checks if the API token is available
       * Used to prevent unnecessary API calls when no token is configured
       * 
       * @returns boolean indicating if token is available
       */
      hasApiToken() {
        return !!this.apiToken;
      }
      /**
       * Makes API request with retry logic and proper error handling
       * This is the core method that handles the actual HTTP request
       * 
       * @param forceFresh If true, forces a fresh API request even if recently cached
       * @returns Parsed JSON response from the API
       * @throws Error if request fails after all retry attempts
       */
      async makeApiRequest(forceFresh = false) {
        const now = Date.now();
        const cacheMaxAge = 15 * 60 * 1e3;
        if (!forceFresh && this.lastSuccessfulResponse && now - this.lastFetchTime < cacheMaxAge) {
          console.log(`Using cached API response from ${Math.round((now - this.lastFetchTime) / 1e3)} seconds ago`);
          return this.lastSuccessfulResponse;
        }
        let retryCount = 0;
        let lastError = null;
        const urlToUse = this.apiUrl.startsWith("http") ? this.apiUrl : `https://${this.apiUrl}`;
        console.log(`Using normalized API URL: ${urlToUse}`);
        while (retryCount <= this.maxRetries) {
          try {
            if (retryCount > 0) {
              console.log(`Retry attempt ${retryCount}/${this.maxRetries}`);
            } else {
              console.log(`Attempting API request to: ${urlToUse}`);
              const tokenPreview = this.apiToken.length > 10 ? `${this.apiToken.substring(0, 5)}...${this.apiToken.substring(this.apiToken.length - 5)}` : this.apiToken.substring(0, 3) + "...";
              console.log(`Using authorization: Bearer ${tokenPreview}`);
            }
            const controller = new AbortController();
            let timeoutId = null;
            timeoutId = setTimeout(() => {
              console.warn(`Request timeout after ${this.requestTimeout}ms, aborting...`);
              controller.abort();
            }, this.requestTimeout);
            console.log(`Starting fetch with timeout of ${this.requestTimeout}ms`);
            const response = await fetch(urlToUse, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${this.apiToken}`,
                "Accept": "*/*",
                // Accept any content type
                "Content-Type": "application/x-www-form-urlencoded",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
              },
              signal: controller.signal
            });
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            console.log(`Received response with status: ${response.status}`);
            if (!response.ok) {
              const errorText = await response.text();
              console.error(`API error response (${response.status}):`, errorText.substring(0, 200));
              throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }
            const rawText = await response.text();
            console.log(`Received raw API response (length: ${rawText.length} chars)`);
            if (rawText.length > 0) {
              console.log(`Response sample: ${rawText.substring(0, Math.min(200, rawText.length))}...`);
            }
            if (!rawText || rawText.trim() === "") {
              throw new Error("API returned empty response");
            }
            let data;
            try {
              data = JSON.parse(rawText);
              console.log(`Successfully parsed JSON response with ${response.status} status`);
            } catch (jsonError) {
              console.warn("Failed to parse response as JSON:", String(jsonError));
              console.warn("Raw text sample:", rawText.substring(0, 100) + "...");
              data = { rawText, parseError: true };
            }
            this.lastSuccessfulResponse = data;
            this.lastFetchTime = now;
            return data;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            const isTimeoutError = lastError.name === "AbortError" || lastError.message.includes("timeout") || lastError.message.includes("abort");
            const isNetworkError = lastError.message.includes("network") || lastError.message.includes("fetch") || lastError.message.includes("connect");
            if (isTimeoutError) {
              console.error(`API request timed out (attempt ${retryCount + 1}/${this.maxRetries + 1})`);
              console.error(`Timeout details: Limit=${this.requestTimeout}ms, Error=${lastError.message}`);
            } else if (isNetworkError) {
              console.error(`Network error (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, lastError.message);
              console.error(`Check network connectivity and API endpoint: ${urlToUse}`);
            } else {
              console.error(`API request failed (attempt ${retryCount + 1}/${this.maxRetries + 1}):`, lastError.message);
            }
            if (retryCount >= this.maxRetries) {
              console.warn(`Exhausted all ${this.maxRetries + 1} attempts to reach the API`);
              break;
            }
            const sleepTime = getSleepTime(retryCount);
            console.log(`Waiting ${sleepTime}ms before next retry...`);
            await sleep(sleepTime);
            retryCount++;
          }
        }
        if (this.lastSuccessfulResponse) {
          console.warn("Returning stale cached data because fresh API request failed");
          return this.lastSuccessfulResponse;
        }
        const errorMessage = lastError ? `API request failed after ${this.maxRetries + 1} attempts: ${lastError.message}` : "API request failed with unknown error";
        console.error(`Final error: ${errorMessage}`);
        console.error(`API URL: ${urlToUse}`);
        console.error(`Timeout setting: ${this.requestTimeout}ms`);
        throw new Error(errorMessage);
      }
      /**
       * Placeholder method for future implementation of profile syncing
       * This is not currently implemented but stubbed for compatibility
       */
      async syncUserProfiles() {
        console.log("syncUserProfiles method called (placeholder)");
        return {
          created: 0,
          updated: 0,
          existing: 0
        };
      }
      /**
       * Placeholder method for future implementation of wager data updates
       * This is not currently implemented but stubbed for compatibility
       */
      async updateAllWagerData() {
        console.log("updateAllWagerData method called (placeholder)");
        return 0;
      }
      /**
       * Checks if a Goated username exists and returns its Goated ID.
       * This is a simplified implementation that searches within the fetched referral data.
       * A more robust solution would query a dedicated API endpoint if available.
       */
      async checkGoatedUsername(username) {
        console.log(`GoatedApiService: Checking username ${username}`);
        try {
          const referralData = await this.fetchReferralData();
          if (referralData && referralData.data && referralData.data.all_time && referralData.data.all_time.data) {
            const users3 = referralData.data.all_time.data;
            const foundUser = users3.find((u) => u.name && u.name.toLowerCase() === username.toLowerCase());
            if (foundUser) {
              console.log(`GoatedApiService: Username ${username} found with ID ${foundUser.uid}`);
              return { exists: true, goatedId: foundUser.uid };
            }
          }
          console.log(`GoatedApiService: Username ${username} not found`);
          return { exists: false };
        } catch (error) {
          console.error(`GoatedApiService: Error checking username ${username}:`, error);
          throw error;
        }
      }
      /**
       * Fetches detailed information for a specific user by their Goated ID.
       * This implementation searches within the fetched referral data.
       */
      async getUserInfo(goatedId) {
        console.log(`GoatedApiService: Getting user info for Goated ID ${goatedId}`);
        try {
          const referralData = await this.fetchReferralData();
          if (referralData && referralData.data) {
            const timeframes = ["all_time", "monthly", "weekly", "today"];
            for (const timeframe of timeframes) {
              if (referralData.data[timeframe] && referralData.data[timeframe].data) {
                const users3 = referralData.data[timeframe].data;
                const foundUser = users3.find((u) => u.uid === goatedId);
                if (foundUser) {
                  console.log(`GoatedApiService: User info found for ID ${goatedId}`);
                  return foundUser;
                }
              }
            }
          }
          console.log(`GoatedApiService: User info not found for ID ${goatedId}`);
          return null;
        } catch (error) {
          console.error(`GoatedApiService: Error getting user info for ID ${goatedId}:`, error);
          throw error;
        }
      }
      /**
       * Alias for getUserInfo, as findUserByGoatedId is used in profileService.
       */
      async findUserByGoatedId(goatedId) {
        return this.getUserInfo(goatedId);
      }
      /**
       * Fetches wager data for a specific user by their Goated ID.
       * This implementation extracts wager data from the user info.
       */
      async getUserWagerData(goatedId) {
        console.log(`GoatedApiService: Getting wager data for Goated ID ${goatedId}`);
        try {
          const userInfo = await this.getUserInfo(goatedId);
          if (userInfo && userInfo.wagered) {
            console.log(`GoatedApiService: Wager data found for ID ${goatedId}`);
            return userInfo.wagered;
          }
          console.log(`GoatedApiService: Wager data not found for ID ${goatedId}`);
          return null;
        } catch (error) {
          console.error(`GoatedApiService: Error getting wager data for ID ${goatedId}:`, error);
          throw error;
        }
      }
    };
    goatedApiService_default = new GoatedApiService();
  }
});

// server/services/cacheService.ts
var cacheService_exports = {};
__export(cacheService_exports, {
  CacheService: () => CacheService,
  cacheService: () => cacheService,
  withCache: () => withCache
});
async function withCache(key, fetcher, options = {}) {
  const {
    namespace = "default",
    ttl = 2 * 60 * 1e3,
    // 2 minutes
    staleWhileRevalidate = true,
    errorTtl = 30 * 1e3,
    forceRefresh = false
  } = options;
  if (cacheService.isRefreshing(key, namespace) && !forceRefresh) {
    const { data: data2, found: found2 } = cacheService.get(key, { namespace, staleWhileRevalidate: true });
    if (found2) {
      return data2;
    }
  }
  const { data, found, stale } = cacheService.get(key, {
    namespace,
    staleWhileRevalidate,
    forceRefresh
  });
  if (found && !stale && !forceRefresh) {
    return data;
  }
  cacheService.markRefreshing(key, namespace);
  try {
    const fresh = await fetcher();
    cacheService.set(key, fresh, { namespace, ttl });
    cacheService.markRefreshComplete(key, namespace);
    return fresh;
  } catch (error) {
    if (error instanceof Error) {
      cacheService.setError(key, error, { namespace, errorTtl });
    }
    cacheService.markRefreshComplete(key, namespace);
    if (found && staleWhileRevalidate) {
      console.warn(`Error refreshing ${key}, using stale data:`, error);
      return data;
    }
    throw error;
  }
}
var CacheService, cacheService;
var init_cacheService = __esm({
  "server/services/cacheService.ts"() {
    "use strict";
    CacheService = class {
      // 30 seconds
      constructor() {
        // Default TTL values in milliseconds
        this.DEFAULT_TTL = 2 * 60 * 1e3;
        // 2 minutes
        this.DEFAULT_ERROR_TTL = 30 * 1e3;
        this.cache = /* @__PURE__ */ new Map();
        this.refreshingKeys = /* @__PURE__ */ new Set();
        this.stats = {
          hits: 0,
          misses: 0,
          staleHits: 0,
          keys: 0
        };
      }
      /**
       * Generate a cache key from request data
       */
      generateKey(namespace, ...parts) {
        const keyParts = [namespace];
        for (const part of parts) {
          if (typeof part === "object") {
            keyParts.push(JSON.stringify(part, Object.keys(part).sort()));
          } else {
            keyParts.push(String(part));
          }
        }
        return keyParts.join(":");
      }
      /**
       * Set a value in the cache
       */
      set(key, data, options = {}) {
        const {
          ttl = this.DEFAULT_TTL,
          namespace = "default"
        } = options;
        const now = Date.now();
        const fullKey = this.generateKey(namespace, key);
        this.cache.set(fullKey, {
          data,
          timestamp: now,
          validUntil: now + ttl
        });
        this.stats.keys = this.cache.size;
      }
      /**
       * Cache network errors with a shorter TTL to allow for recovery
       */
      setError(key, error, options = {}) {
        const {
          errorTtl = this.DEFAULT_ERROR_TTL,
          namespace = "default"
        } = options;
        const fullKey = this.generateKey(namespace, key);
        const now = Date.now();
        this.cache.set(fullKey, {
          data: {
            error: true,
            message: error.message,
            name: error.name
          },
          timestamp: now,
          validUntil: now + errorTtl
        });
      }
      /**
       * Get a value from the cache with TTL validation
       */
      get(key, options = {}) {
        const {
          namespace = "default",
          staleWhileRevalidate = false,
          forceRefresh = false
        } = options;
        const fullKey = this.generateKey(namespace, key);
        const cachedItem = this.cache.get(fullKey);
        const now = Date.now();
        if (forceRefresh) {
          this.stats.misses++;
          return { data: null, found: false, stale: false };
        }
        if (!cachedItem) {
          this.stats.misses++;
          return { data: null, found: false, stale: false };
        }
        const isExpired = now > cachedItem.validUntil;
        if (!isExpired) {
          this.stats.hits++;
          return { data: cachedItem.data, found: true, stale: false };
        }
        if (staleWhileRevalidate) {
          this.stats.staleHits++;
          return { data: cachedItem.data, found: true, stale: true };
        }
        this.stats.misses++;
        return { data: null, found: false, stale: false };
      }
      /**
       * Remove a specific key from the cache
       */
      invalidate(key, namespace = "default") {
        const fullKey = this.generateKey(namespace, key);
        this.cache.delete(fullKey);
        this.stats.keys = this.cache.size;
      }
      /**
       * Invalidate all keys in a specific namespace
       */
      invalidateNamespace(namespace) {
        const keysToDelete = [];
        Array.from(this.cache.keys()).forEach((key) => {
          if (key.startsWith(`${namespace}:`)) {
            keysToDelete.push(key);
          }
        });
        for (const key of keysToDelete) {
          this.cache.delete(key);
        }
        this.stats.keys = this.cache.size;
      }
      /**
       * Clear all cached items
       */
      clear() {
        this.cache.clear();
        this.stats.keys = 0;
      }
      /**
       * Get cache statistics
       */
      getStats() {
        return { ...this.stats };
      }
      /**
       * Check if a cache key is currently being refreshed
       */
      isRefreshing(key, namespace = "default") {
        const fullKey = this.generateKey(namespace, key);
        return this.refreshingKeys.has(fullKey);
      }
      /**
       * Mark a key as currently being refreshed
       */
      markRefreshing(key, namespace = "default") {
        const fullKey = this.generateKey(namespace, key);
        this.refreshingKeys.add(fullKey);
      }
      /**
       * Mark a key as no longer being refreshed
       */
      markRefreshComplete(key, namespace = "default") {
        const fullKey = this.generateKey(namespace, key);
        this.refreshingKeys.delete(fullKey);
      }
      /**
       * Get a list of all cache keys
       */
      getKeys() {
        return Array.from(this.cache.keys());
      }
    };
    cacheService = new CacheService();
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";
import cookieParser from "cookie-parser";
import { createServer as createServer2 } from "http";

// server/config/websocket.ts
import { WebSocketServer, WebSocket } from "ws";

// server/utils/logger.ts
function log(message, levelOrSource = "info", source) {
  let level = "info";
  if (levelOrSource === "info" || levelOrSource === "warn" || levelOrSource === "error" || levelOrSource === "debug") {
    level = levelOrSource;
  } else if (typeof levelOrSource === "string") {
    source = levelOrSource;
  }
  const timestamp4 = (/* @__PURE__ */ new Date()).toISOString();
  const sourceStr = source ? `[${source}]` : "";
  const levelStr = `[${level.toUpperCase()}]`;
  const prefix = `${timestamp4} ${levelStr} ${sourceStr}`;
  let outputFn = console.log;
  if (level === "warn") {
    outputFn = console.warn;
  } else if (level === "error") {
    outputFn = console.error;
  }
  if (typeof message === "string") {
    outputFn(`${prefix} ${message}`);
  } else {
    outputFn(`${prefix} Object:`, message);
  }
}

// server/config/websocket.ts
var wssInstances = /* @__PURE__ */ new Map();
function createWebSocketServer(server2, path5, connectionHandler) {
  if (wssInstances.has(path5)) {
    const existingWss = wssInstances.get(path5);
    log("info", `Using existing WebSocket server for path: ${path5}`);
    return existingWss;
  }
  const wss = new WebSocketServer({ server: server2, path: path5 });
  wssInstances.set(path5, wss);
  log("info", `WebSocket server created for path: ${path5}`);
  wss.on("connection", (ws, req) => {
    if (req.headers["sec-websocket-protocol"]?.includes("vite-hmr")) {
      return;
    }
    log("info", `New WebSocket connection established on ${path5}`);
    ws.on("error", (error) => {
      log("error", `WebSocket error on ${path5}: ${error.message}`);
    });
    ws.isAlive = true;
    ws.on("pong", () => {
      ws.isAlive = true;
    });
    connectionHandler(ws, req);
  });
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extendedWs = ws;
      if (extendedWs.isAlive === false) {
        log("info", `Terminating inactive WebSocket connection on ${path5}`);
        return ws.terminate();
      }
      extendedWs.isAlive = false;
      ws.ping();
    });
  }, 3e4);
  wss.on("close", () => {
    clearInterval(heartbeatInterval);
    wssInstances.delete(path5);
    log("info", `WebSocket server for ${path5} closed`);
  });
  return wss;
}
function closeAllWebSocketServers() {
  wssInstances.forEach((wss, path5) => {
    log("info", `Closing WebSocket server for path: ${path5}`);
    wss.close();
  });
  wssInstances.clear();
}

// server/index.ts
import fs from "fs";
import path4 from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { createServer as createViteServer2, createLogger as createLogger2 } from "vite";
import { promisify } from "util";
import { exec } from "child_process";
import { sql as sql8 } from "drizzle-orm";
import compression2 from "compression";

// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  affiliateStats: () => affiliateStats,
  bonusCodeRelations: () => bonusCodeRelations,
  bonusCodes: () => bonusCodes,
  goatedWagerLeaderboard: () => goatedWagerLeaderboard,
  historicalRaces: () => historicalRaces,
  insertAffiliateStatsSchema: () => insertAffiliateStatsSchema,
  insertBonusCodeSchema: () => insertBonusCodeSchema,
  insertHistoricalRaceSchema: () => insertHistoricalRaceSchema,
  insertLeaderboardUserSchema: () => insertLeaderboardUserSchema,
  insertMockWagerDataSchema: () => insertMockWagerDataSchema,
  insertNewsletterSubscriptionSchema: () => insertNewsletterSubscriptionSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertSyncLogSchema: () => insertSyncLogSchema,
  insertTicketMessageSchema: () => insertTicketMessageSchema,
  insertTransformationLogSchema: () => insertTransformationLogSchema,
  insertUserSchema: () => insertUserSchema,
  insertWagerRaceParticipantSchema: () => insertWagerRaceParticipantSchema,
  insertWagerRaceSchema: () => insertWagerRaceSchema,
  insertWheelSpinSchema: () => insertWheelSpinSchema,
  leaderboardUsers: () => leaderboardUsers,
  mockWagerData: () => mockWagerData,
  mockWagerDataRelations: () => mockWagerDataRelations,
  newsletterSubscriptions: () => newsletterSubscriptions,
  notificationPreferences: () => notificationPreferences,
  selectAffiliateStatsSchema: () => selectAffiliateStatsSchema,
  selectBonusCodeSchema: () => selectBonusCodeSchema,
  selectHistoricalRaceSchema: () => selectHistoricalRaceSchema,
  selectLeaderboardUserSchema: () => selectLeaderboardUserSchema,
  selectMockWagerDataSchema: () => selectMockWagerDataSchema,
  selectNewsletterSubscriptionSchema: () => selectNewsletterSubscriptionSchema,
  selectSupportTicketSchema: () => selectSupportTicketSchema,
  selectSyncLogSchema: () => selectSyncLogSchema,
  selectTicketMessageSchema: () => selectTicketMessageSchema,
  selectTransformationLogSchema: () => selectTransformationLogSchema,
  selectUserSchema: () => selectUserSchema,
  selectWagerRaceParticipantSchema: () => selectWagerRaceParticipantSchema,
  selectWagerRaceSchema: () => selectWagerRaceSchema,
  selectWheelSpinSchema: () => selectWheelSpinSchema,
  supportTicketRelations: () => supportTicketRelations,
  supportTickets: () => supportTickets,
  syncLogs: () => syncLogs,
  ticketMessageRelations: () => ticketMessageRelations,
  ticketMessages: () => ticketMessages,
  transformationLogs: () => transformationLogs,
  userRelations: () => userRelations,
  users: () => users,
  wagerRaceParticipantRelations: () => wagerRaceParticipantRelations,
  wagerRaceParticipants: () => wagerRaceParticipants,
  wagerRaceRelations: () => wagerRaceRelations,
  wagerRaces: () => wagerRaces,
  wheelSpinRelations: () => wheelSpinRelations,
  wheelSpins: () => wheelSpins
});
import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
  decimal,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  emailVerified: boolean("email_verified").default(false),
  // Profile fields
  bio: text("bio"),
  profileColor: text("profile_color").default("#D7FF00"),
  goatedId: text("goated_id").unique(),
  goatedUsername: text("goated_username"),
  goatedAccountLinked: boolean("goated_account_linked").default(false),
  goatedLinkRequested: boolean("goated_link_requested").default(false),
  goatedUsernameRequested: text("goated_username_requested"),
  goatedLinkRequestedAt: timestamp("goated_link_requested_at"),
  // Stats from Goated API
  totalWager: text("total_wager"),
  dailyWager: text("daily_wager"),
  weeklyWager: text("weekly_wager"),
  monthlyWager: text("monthly_wager"),
  // Rank tracking
  dailyRank: integer("daily_rank"),
  weeklyRank: integer("weekly_rank"),
  monthlyRank: integer("monthly_rank"),
  allTimeRank: integer("all_time_rank"),
  // Account verification
  accountVerified: boolean("account_verified").default(false),
  verifiedBy: text("verified_by"),
  verifiedAt: timestamp("verified_at"),
  // Last data update timestamp
  lastUpdated: timestamp("last_updated"),
  lastWagerSync: timestamp("last_wager_sync"),
  // Email verification fields
  emailVerificationToken: text("email_verification_token"),
  emailVerificationSentAt: timestamp("email_verification_sent_at"),
  emailVerifiedAt: timestamp("email_verified_at"),
  // Activity tracking
  lastActive: timestamp("last_active")
});
var userRelations = relations(users, ({ many }) => ({
  // Keep only core relations
  wheelSpins: many(wheelSpins),
  wagerRaceParticipations: many(wagerRaceParticipants)
}));
var insertUserSchema = createInsertSchema(users);
var selectUserSchema = createSelectSchema(users);
var wheelSpins = pgTable("wheel_spins", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  segmentIndex: integer("segment_index").notNull(),
  rewardCode: text("reward_code"),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var bonusCodes = pgTable("bonus_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull()
});
var wagerRaces = pgTable("wager_races", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  // 'weekly' | 'monthly' | 'weekend'
  status: text("status").notNull(),
  // 'upcoming' | 'live' | 'completed'
  prizePool: decimal("prize_pool", { precision: 18, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  minWager: decimal("min_wager", { precision: 18, scale: 2 }).default("0").notNull(),
  prizeDistribution: jsonb("prize_distribution").default({}).notNull(),
  // { "1": 25, "2": 15, ... }
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  rules: text("rules"),
  description: text("description"),
  name: text("name")
  // Added for backwards compatibility
});
var wagerRaceParticipants = pgTable("wager_race_participants", {
  id: serial("id").primaryKey(),
  raceId: integer("race_id").references(() => wagerRaces.id),
  userId: integer("user_id").references(() => users.id),
  // Reference to internal users
  username: text("username").notNull(),
  // Store username directly
  wagered: decimal("wagered", { precision: 18, scale: 2 }).notNull(),
  // Total amount wagered
  position: integer("position").notNull(),
  // Position in the race (1st, 2nd, etc.)
  prizeAmount: decimal("prize_amount", { precision: 18, scale: 2 }).default("0"),
  prizeClaimed: boolean("prize_claimed").default(false).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  wagerHistory: jsonb("wager_history"),
  // Track wager progress over time
  // Keeping column compatibility with actual database schema
  totalWager: decimal("total_wager_backup", { precision: 18, scale: 2 }),
  rank: integer("rank_backup")
});
var supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"),
  // 'open' | 'in_progress' | 'closed'
  priority: text("priority").notNull().default("medium"),
  // 'low' | 'medium' | 'high'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var ticketMessages = pgTable("ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id),
  userId: integer("user_id").references(() => users.id),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isStaffReply: boolean("is_staff_reply").default(false).notNull()
});
var wheelSpinRelations = relations(wheelSpins, ({ one }) => ({
  user: one(users, {
    fields: [wheelSpins.userId],
    references: [users.id]
  })
}));
var bonusCodeRelations = relations(bonusCodes, ({ one }) => ({
  user: one(users, {
    fields: [bonusCodes.userId],
    references: [users.id]
  })
}));
var wagerRaceRelations = relations(wagerRaces, ({ many }) => ({
  participants: many(wagerRaceParticipants)
}));
var wagerRaceParticipantRelations = relations(
  wagerRaceParticipants,
  ({ one }) => ({
    race: one(wagerRaces, {
      fields: [wagerRaceParticipants.raceId],
      references: [wagerRaces.id]
    }),
    user: one(users, {
      fields: [wagerRaceParticipants.userId],
      references: [users.id]
    })
  })
);
var supportTicketRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id]
  }),
  messages: many(ticketMessages)
}));
var ticketMessageRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [ticketMessages.ticketId],
    references: [supportTickets.id]
  }),
  user: one(users, {
    fields: [ticketMessages.userId],
    references: [users.id]
  })
}));
var insertWheelSpinSchema = createInsertSchema(wheelSpins);
var selectWheelSpinSchema = createSelectSchema(wheelSpins);
var insertBonusCodeSchema = createInsertSchema(bonusCodes);
var selectBonusCodeSchema = createSelectSchema(bonusCodes);
var insertWagerRaceSchema = createInsertSchema(wagerRaces);
var selectWagerRaceSchema = createSelectSchema(wagerRaces);
var insertWagerRaceParticipantSchema = createInsertSchema(
  wagerRaceParticipants
);
var selectWagerRaceParticipantSchema = createSelectSchema(
  wagerRaceParticipants
);
var insertSupportTicketSchema = createInsertSchema(supportTickets);
var selectSupportTicketSchema = createSelectSchema(supportTickets);
var insertTicketMessageSchema = createInsertSchema(ticketMessages);
var selectTicketMessageSchema = createSelectSchema(ticketMessages);
var historicalRaces = pgTable("historical_races", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: text("year").notNull(),
  prizePool: decimal("prize_pool", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  participants: jsonb("participants").notNull(),
  totalWagered: decimal("total_wagered", { precision: 18, scale: 2 }).notNull(),
  participantCount: text("participant_count").notNull(),
  status: text("status").notNull().default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata").default({}).notNull()
});
var newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  isSubscribed: boolean("is_subscribed").default(true).notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  source: text("source")
});
var notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  wagerRaceUpdates: boolean("wager_race_updates").default(true).notNull(),
  vipStatusChanges: boolean("vip_status_changes").default(true).notNull(),
  promotionalOffers: boolean("promotional_offers").default(true).notNull(),
  monthlyStatements: boolean("monthly_statements").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var affiliateStats = pgTable("affiliate_stats", {
  id: serial("id").primaryKey(),
  totalWager: decimal("total_wager", { precision: 18, scale: 8 }).notNull(),
  commission: decimal("commission", { precision: 18, scale: 8 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var mockWagerData = pgTable("mock_wager_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  username: text("username").notNull(),
  wageredToday: decimal("wagered_today", { precision: 18, scale: 8 }).default("0").notNull(),
  wageredThisWeek: decimal("wagered_this_week", { precision: 18, scale: 8 }).default("0").notNull(),
  wageredThisMonth: decimal("wagered_this_month", { precision: 18, scale: 8 }).default("0").notNull(),
  wageredAllTime: decimal("wagered_all_time", { precision: 18, scale: 8 }).default("0").notNull(),
  isMocked: boolean("is_mocked").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id)
});
var mockWagerDataRelations = relations(mockWagerData, ({ one }) => ({
  user: one(users, {
    fields: [mockWagerData.userId],
    references: [users.id]
  }),
  creator: one(users, {
    fields: [mockWagerData.createdBy],
    references: [users.id]
  })
}));
var transformationLogs = pgTable("transformation_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  // 'info' | 'error' | 'warning'
  message: text("message").notNull(),
  payload: jsonb("payload"),
  duration_ms: decimal("duration_ms", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  error_message: text("error_message")
});
var insertNewsletterSubscriptionSchema = createInsertSchema(
  newsletterSubscriptions
);
var selectNewsletterSubscriptionSchema = createSelectSchema(
  newsletterSubscriptions
);
var insertHistoricalRaceSchema = createInsertSchema(historicalRaces);
var selectHistoricalRaceSchema = createSelectSchema(historicalRaces);
var insertAffiliateStatsSchema = createInsertSchema(affiliateStats);
var selectAffiliateStatsSchema = createSelectSchema(affiliateStats);
var insertMockWagerDataSchema = createInsertSchema(mockWagerData);
var selectMockWagerDataSchema = createSelectSchema(mockWagerData);
var syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  // Type of sync: 'profile', 'wager', etc.
  status: text("status").notNull(),
  // 'success', 'error', 'pending'
  error_message: text("error_message"),
  duration_ms: decimal("duration_ms", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow().notNull()
});
var insertTransformationLogSchema = createInsertSchema(transformationLogs);
var selectTransformationLogSchema = createSelectSchema(transformationLogs);
var insertSyncLogSchema = createInsertSchema(syncLogs);
var selectSyncLogSchema = createSelectSchema(syncLogs);
var goatedWagerLeaderboard = pgTable("goated_wager_leaderboard", {
  uid: text("uid").primaryKey(),
  name: text("name").notNull(),
  wagered_today: decimal("wagered_today", { precision: 18, scale: 8 }).notNull().default("0"),
  wagered_this_week: decimal("wagered_this_week", { precision: 18, scale: 8 }).notNull().default("0"),
  wagered_this_month: decimal("wagered_this_month", { precision: 18, scale: 8 }).notNull().default("0"),
  wagered_all_time: decimal("wagered_all_time", { precision: 18, scale: 8 }).notNull().default("0"),
  last_synced: timestamp("last_synced").defaultNow().notNull()
});
var leaderboardUsers = pgTable("leaderboard_users", {
  id: serial("id").primaryKey(),
  uid: text("uid").unique().notNull(),
  name: text("name").notNull(),
  wager_today: decimal("wager_today", { precision: 18, scale: 8 }).default("0").notNull(),
  wager_week: decimal("wager_week", { precision: 18, scale: 8 }).default("0").notNull(),
  wager_month: decimal("wager_month", { precision: 18, scale: 8 }).default("0").notNull(),
  wager_all_time: decimal("wager_all_time", { precision: 18, scale: 8 }).default("0").notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});
var insertLeaderboardUserSchema = createInsertSchema(leaderboardUsers);
var selectLeaderboardUserSchema = createSelectSchema(leaderboardUsers);

// server/vite.ts
import express from "express";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [react(), runtimeErrorOverlay(), themePlugin()],
  resolve: {
    alias: {
      "@db": path.resolve(__dirname, "db"),
      "@": path.resolve(__dirname, "client", "src")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5170",
        changeOrigin: true,
        secure: false
      },
      "/ws": {
        target: "ws://localhost:5170",
        ws: true,
        changeOrigin: true
      }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// db/index.ts
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var sql2 = neon(process.env.DATABASE_URL);
var db = drizzle(sql2, { schema: schema_exports });
sql2`SELECT 1`.then(() => {
  log2("Database connection established successfully");
}).catch((error) => {
  log2(`Database connection error: ${error.message}`);
});

// server/services/profileService.ts
import { eq } from "drizzle-orm";

// server/utils/auth-utils.ts
import jwt from "jsonwebtoken";
var AUTH_ERROR_MESSAGES = {
  AUTH_REQUIRED: "Authentication required",
  INVALID_TOKEN: "Invalid authentication token",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid username or password",
  ADMIN_UNAUTHORIZED: "Unauthorized: Admin access required",
  TOKEN_MISSING: "Authentication token is missing",
  TOKEN_EXPIRED: "Authentication token has expired",
  SESSION_EXPIRED: "Your session has expired. Please log in again",
  PERMISSION_DENIED: "You do not have permission to access this resource"
};
async function preparePassword(password) {
  return password;
}
async function verifyPassword(providedPassword, storedPassword) {
  return providedPassword === storedPassword;
}
function extractTokenFromRequest(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  if (req.query && req.query.token && typeof req.query.token === "string") {
    return req.query.token;
  }
  return null;
}
function validateAdminCredentials(username, password, secretKey) {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
  const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "";
  if (secretKey) {
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD && secretKey === ADMIN_KEY;
  }
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
function setAdminSession(req) {
  if (req.session) {
    req.session.isAdmin = true;
  }
}
function clearAdminSession(req) {
  if (req.session) {
    req.session.isAdmin = false;
  }
}

// server/services/profileService.ts
init_goatedApiService();

// server/services/statSyncService.ts
init_goatedApiService();
var StatSyncService = class {
  /**
   * Get leaderboard data for all timeframes
   * Used by the /api/affiliate/stats endpoint
   */
  async getLeaderboardData() {
    const startTime = Date.now();
    console.log("StatSyncService: Fetching and transforming leaderboard data");
    try {
      const rawData = await goatedApiService_default.fetchReferralData();
      console.log("StatSyncService: Raw data received:", !!rawData);
      if (!rawData) {
        throw new Error("No raw data received from external API");
      }
      const transformedData = this.transformToLeaderboard(rawData);
      console.log("StatSyncService: Data transformed successfully:", !!transformedData);
      if (!transformedData) {
        throw new Error("Failed to transform data - transformToLeaderboard returned null/undefined");
      }
      if (!transformedData.data || !transformedData.data.all_time) {
        throw new Error("Transformed data is missing required structure");
      }
      await this.logTransformation(
        "leaderboard",
        "success",
        `Transformed leaderboard data with ${transformedData.data.all_time.data.length} users`,
        Date.now() - startTime
      );
      return transformedData;
    } catch (error) {
      console.error("StatSyncService: Error in getLeaderboardData:", error);
      await this.logTransformation(
        "leaderboard",
        "error",
        `Failed to transform leaderboard data: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Get aggregated statistics from leaderboard data
   * Used for analytics and admin dashboards
   */
  async getAggregatedStats() {
    const startTime = Date.now();
    console.log("StatSyncService: Calculating aggregated statistics");
    try {
      const leaderboardData = await this.getLeaderboardData();
      const allUsers = [
        ...leaderboardData.data?.today?.data || [],
        ...leaderboardData.data?.weekly?.data || [],
        ...leaderboardData.data?.monthly?.data || [],
        ...leaderboardData.data?.all_time?.data || []
      ];
      const uniqueUsers = Array.from(new Set(allUsers.map((user) => user.uid))).map((uid) => allUsers.find((user) => user.uid === uid)).filter(Boolean);
      const totals = uniqueUsers.reduce((acc, entry) => {
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
      const userCount = uniqueUsers.length;
      const averageWager = userCount > 0 ? totals.allTimeTotal / userCount : 0;
      const topWager = Math.max(...uniqueUsers.map((u) => u.wagered.all_time || 0));
      const stats = {
        ...totals,
        userCount,
        averageWager,
        topWager
      };
      await this.logTransformation(
        "stats-aggregation",
        "success",
        `Calculated stats for ${userCount} users`,
        Date.now() - startTime
      );
      return stats;
    } catch (error) {
      await this.logTransformation(
        "stats-aggregation",
        "error",
        `Failed to calculate aggregated stats: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Get top performers for each time period
   * Used for MVP cards and featured player displays
   */
  async getTopPerformers(limit = 3) {
    const startTime = Date.now();
    console.log(`StatSyncService: Getting top ${limit} performers for each period`);
    try {
      const leaderboardData = await this.getLeaderboardData();
      const topPerformers = {
        daily: leaderboardData.data.today.data.slice(0, limit),
        weekly: leaderboardData.data.weekly.data.slice(0, limit),
        monthly: leaderboardData.data.monthly.data.slice(0, limit),
        allTime: leaderboardData.data.all_time.data.slice(0, limit)
      };
      await this.logTransformation(
        "top-performers",
        "success",
        `Retrieved top ${limit} performers for all periods`,
        Date.now() - startTime
      );
      return topPerformers;
    } catch (error) {
      await this.logTransformation(
        "top-performers",
        "error",
        `Failed to get top performers: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Get user ranking across all time periods
   * Used for user profile statistics
   */
  async getUserRankings(userId) {
    const startTime = Date.now();
    console.log(`StatSyncService: Getting rankings for user ${userId}`);
    try {
      const leaderboardData = await this.getLeaderboardData();
      const rankings = {
        daily: this.findUserPosition(leaderboardData.data.today.data, userId),
        weekly: this.findUserPosition(leaderboardData.data.weekly.data, userId),
        monthly: this.findUserPosition(leaderboardData.data.monthly.data, userId),
        allTime: this.findUserPosition(leaderboardData.data.all_time.data, userId)
      };
      await this.logTransformation(
        "user-rankings",
        "success",
        `Retrieved rankings for user ${userId}`,
        Date.now() - startTime
      );
      return rankings;
    } catch (error) {
      await this.logTransformation(
        "user-rankings",
        "error",
        `Failed to get user rankings: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Store affiliate statistics snapshot
   * Used for historical tracking and analytics
   */
  async storeAffiliateSnapshot() {
    const startTime = Date.now();
    console.log("StatSyncService: Storing affiliate statistics snapshot");
    try {
      const stats = await this.getAggregatedStats();
      await db.insert(affiliateStats).values({
        totalWager: String(stats.allTimeTotal),
        commission: String(stats.allTimeTotal * 0.02),
        // 2% commission example
        timestamp: /* @__PURE__ */ new Date()
      });
      await this.logTransformation(
        "affiliate-snapshot",
        "success",
        `Stored affiliate snapshot with ${stats.userCount} users`,
        Date.now() - startTime
      );
    } catch (error) {
      await this.logTransformation(
        "affiliate-snapshot",
        "error",
        `Failed to store affiliate snapshot: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  // Private helper methods
  /**
   * Transforms raw API data into standardized leaderboard format
   * Core transformation function for all external data
   */
  transformToLeaderboard(rawData) {
    console.log("StatSyncService: Transforming raw API data to leaderboard format");
    try {
      const dataArray = this.extractDataArray(rawData);
      console.log(`StatSyncService: Extracted ${dataArray.length} users from raw data`);
      if (!Array.isArray(dataArray)) {
        throw new Error("extractDataArray did not return an array");
      }
      const transformedData = dataArray.filter((entry) => entry && typeof entry === "object").map((entry) => ({
        uid: entry.uid || "",
        name: entry.name || "",
        wagered: {
          today: entry.wagered?.today || 0,
          this_week: entry.wagered?.this_week || 0,
          this_month: entry.wagered?.this_month || 0,
          all_time: entry.wagered?.all_time || 0
        }
      })).filter((entry) => entry.uid && entry.name);
      console.log(`StatSyncService: Filtered to ${transformedData.length} valid users`);
      const leaderboardData = {
        status: "success",
        metadata: {
          totalUsers: transformedData.length,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        },
        data: {
          today: { data: this.sortByWagered(transformedData, "today") },
          weekly: { data: this.sortByWagered(transformedData, "this_week") },
          monthly: { data: this.sortByWagered(transformedData, "this_month") },
          all_time: { data: this.sortByWagered(transformedData, "all_time") }
        }
      };
      console.log("StatSyncService: Leaderboard data structure created successfully");
      return leaderboardData;
    } catch (error) {
      console.error("StatSyncService: Error in transformToLeaderboard:", error);
      return {
        status: "error",
        metadata: {
          totalUsers: 0,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        },
        data: {
          today: { data: [] },
          weekly: { data: [] },
          monthly: { data: [] },
          all_time: { data: [] }
        }
      };
    }
  }
  /**
   * Sorts data by wagered amount for the given period
   * Creates sorted leaderboards for each time period
   * Handles ties: same wager = same position, next position skips accordingly
   */
  sortByWagered(data, period) {
    const sorted = [...data].sort((a, b) => {
      const aValue = a.wagered[period] || 0;
      const bValue = b.wagered[period] || 0;
      return bValue - aValue;
    });
    let lastWager = null;
    let lastPosition = 0;
    let skip = 1;
    return sorted.map((entry, idx) => {
      const wager = entry.wagered[period] || 0;
      if (wager === lastWager) {
        skip++;
        return { ...entry, rank: lastPosition };
      } else {
        lastPosition = idx + 1;
        lastWager = wager;
        skip = 1;
        return { ...entry, rank: lastPosition };
      }
    });
  }
  /**
   * Generate a map of userId to position for a given leaderboard (for previous position tracking)
   */
  getUserPositionMap(leaderboardData, period) {
    const sorted = this.sortByWagered(leaderboardData, period);
    const map = {};
    for (const entry of sorted) {
      map[entry.uid] = entry.rank;
    }
    return map;
  }
  /**
   * Extract data array from API response
   * Handles different API response formats
   */
  extractDataArray(apiData) {
    if (!apiData) {
      console.log("StatSyncService: No API data provided");
      return [];
    }
    if (Array.isArray(apiData)) {
      return apiData;
    }
    if (apiData.data && Array.isArray(apiData.data)) {
      return apiData.data;
    }
    if (apiData.data && apiData.data.data && Array.isArray(apiData.data.data)) {
      return apiData.data.data;
    }
    return this.processExtractedJson(apiData);
  }
  /**
   * Process extracted JSON data with various formats
   * Handles complex nested API responses
   */
  processExtractedJson(apiData) {
    const extractedData = [];
    try {
      if (typeof apiData === "object" && apiData !== null) {
        const timeframes = ["today", "weekly", "monthly", "all_time"];
        for (const timeframe of timeframes) {
          if (apiData[timeframe]?.data && Array.isArray(apiData[timeframe].data)) {
            extractedData.push(...apiData[timeframe].data);
          }
        }
      }
      if (extractedData.length > 0) {
        const uniqueData = Array.from(
          new Map(extractedData.map((item) => [item.uid, item])).values()
        );
        console.log(`StatSyncService: Processed ${uniqueData.length} unique users from timeframe data`);
        return uniqueData;
      }
      if (apiData.data) {
        return Array.isArray(apiData.data) ? apiData.data : [apiData.data];
      }
    } catch (error) {
      console.error("StatSyncService: Error processing extracted JSON:", error);
    }
    console.log("StatSyncService: No valid data found in API response");
    return [];
  }
  /**
   * Find user position in leaderboard data
   */
  findUserPosition(leaderboardData, userId) {
    const userIndex = leaderboardData.findIndex((user) => user.uid === userId);
    return userIndex !== -1 ? userIndex + 1 : null;
  }
  /**
   * Log transformation operations
   */
  async logTransformation(type, status, message, durationMs, errorMessage) {
    try {
      await db.insert(transformationLogs).values({
        type: status,
        message: `[stat-${type}] ${message}`,
        duration_ms: String(durationMs),
        created_at: /* @__PURE__ */ new Date(),
        resolved: status !== "error",
        error_message: errorMessage
      });
    } catch (error) {
      console.error("StatSyncService: Failed to log transformation:", error);
    }
  }
};
var statSyncService = new StatSyncService();
var statSyncService_default = statSyncService;

// server/services/profileService.ts
var DEFAULT_BIO_GOATED_PLAYER = "Official Goated.com player profile";
var DEFAULT_BIO_USER_PROFILE = "User profile";
var DEFAULT_BIO_LEADERBOARD_PLAYER = "Goated.com player";
var ProfileService = class {
  /**
   * Ensure a user profile exists
   * Creates profile from Goated API data if available, otherwise creates placeholder
   */
  async ensureUserProfile(userId) {
    if (!userId) return null;
    console.log(`ProfileService: Ensuring profile exists for ID: ${userId}`);
    try {
      const existingUser = await this.findExistingProfile(userId);
      if (existingUser) {
        if (existingUser.goatedId && existingUser.goatedAccountLinked) {
          await this.refreshGoatedUserData(String(existingUser.id), existingUser.goatedId);
        }
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }
      const goatedProfile = await this.createFromGoatedData(userId);
      if (goatedProfile) {
        return goatedProfile;
      }
      return await this.createPlaceholderProfile(userId);
    } catch (error) {
      console.error(`ProfileService: Error ensuring profile for ID ${userId}:`, error);
      return null;
    }
  }
  /**
   * Request Goated account linking
   * Initiates the admin approval process for account linking
   */
  async requestGoatedAccountLink(userId, goatedUsername, privacySettings) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (user.goatedLinkRequested) {
        throw new Error("You already have a pending link request");
      }
      if (user.goatedAccountLinked) {
        throw new Error("Your account is already linked to a Goated account");
      }
      const goatedCheck = await goatedApiService_default.checkGoatedUsername(goatedUsername);
      if (!goatedCheck.exists) {
        throw new Error("Goated username not found or invalid");
      }
      const updatePayload = {
        goatedLinkRequested: true,
        goatedUsernameRequested: goatedUsername
        // goatedLinkRequestedAt: new Date() // Field not in schema
      };
      if (privacySettings) {
        updatePayload.profilePublic = privacySettings.profilePublic;
        updatePayload.showStats = privacySettings.showStats;
      }
      await this.updateUser(userId, updatePayload);
      await this.logProfileOperation(
        "account-link-request",
        "success",
        `User ${userId} requested linking to ${goatedUsername}`,
        0
      );
      return {
        success: true,
        message: "Link request submitted. An admin will review your request.",
        username: goatedUsername
      };
    } catch (error) {
      await this.logProfileOperation(
        "account-link-request",
        "error",
        `Failed to request linking for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        0
      );
      throw error;
    }
  }
  /**
   * Admin approval of Goated account linking
   */
  async approveGoatedAccountLink(userId, goatedId, approvedBy) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.goatedLinkRequested) {
        throw new Error("No pending link request for this user");
      }
      const existingLinked = await this.findUserByGoatedId(goatedId);
      const userIdNumber = parseInt(userId, 10);
      if (existingLinked && existingLinked.id !== userIdNumber) {
        throw new Error("This Goated ID is already linked to another account");
      }
      const goatedUser = await goatedApiService_default.getUserInfo(goatedId);
      if (!goatedUser) {
        throw new Error("Goated user information not found");
      }
      const updatedUser = await this.updateUser(userId, {
        goatedId,
        goatedUsername: goatedUser.name,
        goatedAccountLinked: true,
        goatedLinkRequested: false,
        goatedUsernameRequested: null,
        totalWager: goatedUser.wager?.all_time !== void 0 ? String(goatedUser.wager.all_time) : user.totalWager
        // verifiedBy: approvedBy, // Field not in schema
        // verifiedAt: new Date() // Field not in schema
      });
      await this.logProfileOperation(
        "account-link-approved",
        "success",
        `Admin ${approvedBy} approved linking for user ${userId} to Goated ID ${goatedId}`,
        0
      );
      return updatedUser;
    } catch (error) {
      await this.logProfileOperation(
        "account-link-approved",
        "error",
        `Failed to approve linking for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        0
      );
      throw error;
    }
  }
  /**
   * Admin rejection of Goated account linking
   */
  async rejectGoatedAccountLink(userId, reason, rejectedBy) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.goatedLinkRequested) {
        throw new Error("No pending link request for this user");
      }
      await this.updateUser(userId, {
        goatedLinkRequested: false,
        goatedUsernameRequested: null
      });
      await this.logProfileOperation(
        "account-link-rejected",
        "success",
        `Admin ${rejectedBy} rejected linking for user ${userId}. Reason: ${reason}`,
        0
      );
      return {
        success: true,
        message: "Link request rejected",
        reason
      };
    } catch (error) {
      await this.logProfileOperation(
        "account-link-rejected",
        "error",
        `Failed to reject linking for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        0
      );
      throw error;
    }
  }
  /**
   * Unlink Goated account
   */
  async unlinkGoatedAccount(userId) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.goatedId) {
        throw new Error("No linked account to unlink");
      }
      await this.updateUser(userId, {
        goatedId: null,
        goatedUsername: null,
        goatedAccountLinked: false,
        lastActive: /* @__PURE__ */ new Date(),
        // Reset privacy settings on unlink
        profilePublic: false,
        showStats: false,
        profilePrivacySettings: {}
      });
      await this.logProfileOperation(
        "account-unlinked",
        "success",
        `User ${userId} unlinked their Goated account`,
        0
      );
      return {
        success: true,
        message: "Account unlinked successfully"
      };
    } catch (error) {
      await this.logProfileOperation(
        "account-unlinked",
        "error",
        `Failed to unlink account for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        0
      );
      throw error;
    }
  }
  /**
   * Synchronize all user profiles from Goated API
   * Creates/updates profiles based on current leaderboard data
   */
  async syncUserProfiles(leaderboardData) {
    const startTime = Date.now();
    console.log("ProfileService: Starting profile synchronization");
    try {
      let created = 0;
      let updated = 0;
      let existing = 0;
      if (!leaderboardData) {
        console.log("ProfileService: Fetching transformed leaderboard data for profile sync");
        try {
          leaderboardData = await statSyncService_default.getLeaderboardData();
          console.log("ProfileService: Received leaderboard data:", !!leaderboardData);
        } catch (fetchError) {
          console.error("ProfileService: Error fetching leaderboard data:", fetchError);
          await this.logProfileOperation(
            "profile-sync",
            "error",
            `Failed to fetch leaderboard data: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
            Date.now() - startTime
          );
          throw new Error(`Failed to fetch leaderboard data: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
        }
        if (!leaderboardData) {
          await this.logProfileOperation(
            "profile-sync",
            "error",
            "Leaderboard data is null/undefined",
            Date.now() - startTime
          );
          throw new Error("Leaderboard data is null/undefined");
        }
        if (!leaderboardData.data) {
          await this.logProfileOperation(
            "profile-sync",
            "error",
            "Leaderboard data.data is missing",
            Date.now() - startTime
          );
          throw new Error("Leaderboard data.data is missing");
        }
        if (!leaderboardData.data.all_time) {
          await this.logProfileOperation(
            "profile-sync",
            "error",
            "Leaderboard data.data.all_time is missing",
            Date.now() - startTime
          );
          throw new Error("Leaderboard data.data.all_time is missing");
        }
      }
      const profiles = leaderboardData.data.all_time.data || [];
      if (!profiles.length) {
        await this.logProfileOperation(
          "profile-sync",
          "warning",
          "No profiles found in API response",
          Date.now() - startTime
        );
        return { created, updated, existing, totalProcessed: 0, duration: Date.now() - startTime };
      }
      const rankMaps = this.buildRankMaps(leaderboardData);
      for (const profile of profiles) {
        try {
          const { uid, name, wagered } = profile;
          if (!uid || !name) continue;
          const existingUser = await db.query.users.findFirst({
            where: eq(users.goatedId, uid)
          });
          if (existingUser) {
            const needsUpdate = this.profileNeedsUpdate(existingUser, profile, rankMaps);
            if (needsUpdate) {
              await this.updateExistingProfile(existingUser, profile, rankMaps);
              updated++;
            } else {
              existing++;
            }
          } else {
            await this.createNewProfile(profile, rankMaps);
            created++;
          }
        } catch (error) {
          console.error(`ProfileService: Error processing profile ${profile?.name}:`, error);
          continue;
        }
      }
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        "profile-sync",
        "success",
        `Synced ${created + updated} profiles (${created} created, ${updated} updated, ${existing} unchanged)`,
        duration
      );
      return { created, updated, existing, totalProcessed: profiles.length, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      await this.logProfileOperation(
        "profile-sync",
        "error",
        "Failed to sync profiles",
        duration,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Update wager data for existing users
   */
  async updateWagerData(leaderboardData) {
    const startTime = Date.now();
    console.log("ProfileService: Starting wager data update");
    try {
      const profiles = leaderboardData.data.all_time.data || [];
      if (!profiles.length) {
        await this.logProfileOperation(
          "wager-update",
          "warning",
          "No profiles found for wager update",
          Date.now() - startTime
        );
        return 0;
      }
      let updatedCount = 0;
      for (const profile of profiles) {
        try {
          const { uid, wagered } = profile;
          if (!uid || !wagered) continue;
          const userResult = await db.query.users.findFirst({
            where: eq(users.goatedId, uid)
          });
          if (!userResult) continue;
          await db.update(users).set({
            totalWager: String(wagered.all_time || 0),
            // dailyWager: String(wagered.today || 0), // Field not in schema
            // weeklyWager: String(wagered.this_week || 0), // Field not in schema
            // monthlyWager: String(wagered.this_month || 0), // Field not in schema
            // lastWagerSync: new Date(), // Field not in schema
            lastUpdated: /* @__PURE__ */ new Date()
          }).where(eq(users.goatedId, uid));
          updatedCount++;
        } catch (error) {
          console.error(`ProfileService: Error updating wager data for ${profile.uid}:`, error);
          continue;
        }
      }
      await this.logProfileOperation(
        "wager-update",
        "success",
        `Updated wager data for ${updatedCount} users`,
        Date.now() - startTime
      );
      return updatedCount;
    } catch (error) {
      await this.logProfileOperation(
        "wager-update",
        "error",
        "Failed to update wager data",
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Refresh Goated data for a specific user
   */
  async refreshGoatedUserData(userId, goatedId) {
    try {
      const goatedUser = await goatedApiService_default.findUserByGoatedId(goatedId);
      if (!goatedUser) {
        console.warn(`ProfileService: Goated user ${goatedId} no longer exists, but linked to user ${userId}`);
        return;
      }
      const wagerData = await goatedApiService_default.getUserWagerData(goatedId);
      if (wagerData && wagerData.all_time !== void 0) {
        await db.update(users).set({
          totalWager: String(wagerData.all_time),
          lastActive: /* @__PURE__ */ new Date()
          // lastWagerSync: new Date() // Field not in schema
        }).where(eq(users.id, parseInt(userId, 10)));
      }
    } catch (error) {
      console.error(`ProfileService: Error refreshing Goated data for user ${userId}:`, error);
    }
  }
  /**
   * Check if a Goated username exists (delegates to goatedApiService)
   */
  async checkGoatedUsername(username) {
    return goatedApiService_default.checkGoatedUsername(username);
  }
  // Private helper methods
  /**
   * Find existing profile by ID or Goated ID
   */
  async findExistingProfile(userId) {
    const isNumericId = /^\d+$/.test(userId);
    let user;
    if (isNumericId) {
      user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId, 10))
        // Omitting 'columns' to select all fields, matching SelectUser type
      });
    }
    if (user) {
      return user;
    }
    user = await db.query.users.findFirst({
      where: eq(users.goatedId, userId)
      // Omitting 'columns' to select all fields, matching SelectUser type
    });
    return user || null;
  }
  /**
   * Create profile from Goated API data
   */
  async createFromGoatedData(userId) {
    try {
      const rawData = await goatedApiService_default.fetchReferralData();
      if (!rawData?.data) return null;
      const userData = this.findUserInLeaderboard(userId, rawData);
      if (!userData?.name) return null;
      const email = `goatedid-${userId}@users.goatedvips.com`;
      const randomPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await preparePassword(randomPassword);
      const insertedUsers = await db.insert(users).values({
        username: userData.name,
        email,
        password: hashedPassword,
        // Drizzle requires a password; using a placeholder
        createdAt: /* @__PURE__ */ new Date(),
        // profileColor: '#D7FF00', // Rely on schema default
        bio: DEFAULT_BIO_GOATED_PLAYER,
        isAdmin: false,
        goatedId: userId,
        goatedUsername: userData.name,
        goatedAccountLinked: true
      }).returning({
        id: users.id,
        username: users.username,
        bio: users.bio,
        profileColor: users.profileColor,
        createdAt: users.createdAt,
        goatedId: users.goatedId,
        goatedUsername: users.goatedUsername,
        goatedAccountLinked: users.goatedAccountLinked
      });
      if (insertedUsers.length > 0) {
        console.log(`ProfileService: Created permanent profile for Goated player ${userData.name} (${userId})`);
        return {
          ...insertedUsers[0],
          isNewlyCreated: true,
          isPermanent: true
        };
      }
    } catch (error) {
      console.error(`ProfileService: Failed to create Goated profile for ${userId}:`, error);
    }
    return null;
  }
  /**
   * Create placeholder profile
   */
  async createPlaceholderProfile(userId) {
    try {
      const isNumericId = /^\d+$/.test(userId);
      const tempUsername = isNumericId ? `User ${userId}` : `User ${userId.substring(0, 8)}`;
      const email = `userid-${userId}@users.goatedvips.com`;
      const randomPassword = Math.random().toString(36).substring(2, 10);
      const hashedPassword = await preparePassword(randomPassword);
      const insertedUsers = await db.insert(users).values({
        username: tempUsername,
        email,
        password: hashedPassword,
        // Drizzle requires a password; using a placeholder
        createdAt: /* @__PURE__ */ new Date(),
        // profileColor: '#D7FF00', // Rely on schema default
        bio: DEFAULT_BIO_USER_PROFILE,
        isAdmin: false,
        goatedId: userId,
        // Assuming placeholder profiles might still have a goatedId if it's a Goated user not yet fully synced
        goatedAccountLinked: false
      }).returning({
        id: users.id,
        username: users.username,
        bio: users.bio,
        profileColor: users.profileColor,
        createdAt: users.createdAt,
        goatedId: users.goatedId,
        goatedUsername: users.goatedUsername,
        goatedAccountLinked: users.goatedAccountLinked
      });
      if (insertedUsers.length > 0) {
        console.log(`ProfileService: Created placeholder profile for ID ${userId}`);
        return {
          ...insertedUsers[0],
          isNewlyCreated: true,
          isTemporary: true
          // This flag indicates it's a placeholder
        };
      }
    } catch (error) {
      console.error(`ProfileService: Failed to create placeholder profile for ${userId}:`, error);
    }
    return null;
  }
  /**
   * Find user in leaderboard data
   */
  findUserInLeaderboard(userId, rawData) {
    const timeframes = ["all_time", "monthly", "weekly", "today"];
    for (const timeframe of timeframes) {
      const users3 = rawData?.data?.[timeframe]?.data || [];
      const foundUser = users3.find((u) => u.uid === userId);
      if (foundUser) return foundUser;
    }
    return null;
  }
  /**
   * Build rank maps for all timeframes
   */
  buildRankMaps(leaderboardData) {
    const rankMaps = {
      daily: /* @__PURE__ */ new Map(),
      weekly: /* @__PURE__ */ new Map(),
      monthly: /* @__PURE__ */ new Map(),
      allTime: /* @__PURE__ */ new Map()
    };
    leaderboardData.data.today?.data?.forEach((profile, index2) => {
      if (profile.uid) rankMaps.daily.set(profile.uid, index2 + 1);
    });
    leaderboardData.data.weekly?.data?.forEach((profile, index2) => {
      if (profile.uid) rankMaps.weekly.set(profile.uid, index2 + 1);
    });
    leaderboardData.data.monthly?.data?.forEach((profile, index2) => {
      if (profile.uid) rankMaps.monthly.set(profile.uid, index2 + 1);
    });
    leaderboardData.data.all_time?.data?.forEach((profile, index2) => {
      if (profile.uid) rankMaps.allTime.set(profile.uid, index2 + 1);
    });
    return rankMaps;
  }
  /**
   * Check if profile needs update
   */
  profileNeedsUpdate(existingUser, profile, rankMaps) {
    return existingUser.goatedUsername !== profile.name || existingUser.totalWager !== String(profile.wagered?.all_time || 0);
  }
  /**
   * Update existing profile
   */
  async updateExistingProfile(existingUser, profile, rankMaps) {
    await db.update(users).set({
      goatedUsername: profile.name,
      totalWager: String(profile.wagered?.all_time || 0),
      // dailyWager: String(profile.wagered?.today || 0), // Field not in schema
      // weeklyWager: String(profile.wagered?.this_week || 0), // Field not in schema
      // monthlyWager: String(profile.wagered?.this_month || 0), // Field not in schema
      // dailyRank: rankMaps.daily.get(profile.uid) || null, // Field not in schema
      // weeklyRank: rankMaps.weekly.get(profile.uid) || null, // Field not in schema
      // monthlyRank: rankMaps.monthly.get(profile.uid) || null, // Field not in schema
      // allTimeRank: rankMaps.allTime.get(profile.uid) || null, // Field not in schema
      lastActive: /* @__PURE__ */ new Date(),
      lastUpdated: /* @__PURE__ */ new Date()
      // lastWagerSync: new Date() // Field not in schema
    }).where(eq(users.goatedId, profile.uid));
  }
  /**
   * Create new profile from leaderboard data
   */
  async createNewProfile(profile, rankMaps) {
    const randomPassword = Math.random().toString(36).substring(2, 10);
    const hashedPassword = await preparePassword(randomPassword);
    await db.insert(users).values({
      username: profile.name,
      password: hashedPassword,
      email: `goatedid-${profile.uid}@users.goatedvips.com`,
      goatedId: profile.uid,
      goatedUsername: profile.name,
      goatedAccountLinked: true,
      totalWager: String(profile.wagered?.all_time || 0),
      // dailyWager: String(profile.wagered?.today || 0), // Field not in schema
      // weeklyWager: String(profile.wagered?.this_week || 0), // Field not in schema
      // monthlyWager: String(profile.wagered?.this_month || 0), // Field not in schema
      // dailyRank: rankMaps.daily.get(profile.uid) || null, // Field not in schema
      // weeklyRank: rankMaps.weekly.get(profile.uid) || null, // Field not in schema
      // monthlyRank: rankMaps.monthly.get(profile.uid) || null, // Field not in schema
      // allTimeRank: rankMaps.allTime.get(profile.uid) || null, // Field not in schema
      createdAt: /* @__PURE__ */ new Date(),
      lastUpdated: /* @__PURE__ */ new Date(),
      // lastWagerSync: new Date(), // Field not in schema
      // profileColor: '#D7FF00', // Rely on schema default
      bio: DEFAULT_BIO_LEADERBOARD_PLAYER
    });
  }
  /**
   * Basic user operations
   */
  async findUserById(userId) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, parseInt(userId, 10))
      });
      return user || null;
    } catch (error) {
      console.error(`ProfileService: Error finding user ${userId}:`, error);
      return null;
    }
  }
  async findUserByGoatedId(goatedId) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.goatedId, goatedId)
      });
      return user || null;
    } catch (error) {
      console.error(`ProfileService: Error finding user by Goated ID ${goatedId}:`, error);
      return null;
    }
  }
  async updateUser(userId, updates) {
    const result = await db.update(users).set({
      ...updates,
      lastUpdated: /* @__PURE__ */ new Date()
    }).where(eq(users.id, parseInt(userId, 10))).returning();
    if (!result || result.length === 0) {
      throw new Error("Failed to update user");
    }
    return result[0];
  }
  /**
   * Log profile-related operations
   */
  async logProfileOperation(type, status, message, durationMs, errorMessage) {
    try {
      await db.insert(transformationLogs).values({
        type: status,
        message: `[profile-${type}] ${message}`,
        duration_ms: String(durationMs),
        created_at: /* @__PURE__ */ new Date(),
        resolved: status !== "error",
        error_message: errorMessage
      });
    } catch (error) {
      console.error("ProfileService: Failed to log operation:", error);
    }
  }
};
var profileService = new ProfileService();
var profileService_default = profileService;

// server/routes.ts
import { Router as Router6 } from "express";
import compression from "compression";
import { sql as sql7 } from "drizzle-orm";
import { createServer } from "http";
import { WebSocket as WebSocket2 } from "ws";
init_api();
import { RateLimiterMemory as RateLimiterMemory5 } from "rate-limiter-flexible";

// server/routes/bonus-challenges.ts
import { Router } from "express";

// db/schema/bonus.ts
import { pgTable as pgTable3, text as text3, timestamp as timestamp3, integer as integer3, boolean as boolean3 } from "drizzle-orm/pg-core";
import { sql as sql5 } from "drizzle-orm";

// db/schema/users.ts
import { pgTable as pgTable2, text as text2, timestamp as timestamp2, integer as integer2, boolean as boolean2, jsonb as jsonb2, index } from "drizzle-orm/pg-core";
import { sql as sql4 } from "drizzle-orm";
import { relations as relations2 } from "drizzle-orm";
var sessions = pgTable2("sessions", {
  id: text2("id").primaryKey(),
  userId: integer2("user_id").references(() => users2.id),
  expiresAt: timestamp2("expires_at").notNull(),
  data: text2("data")
});
var users2 = pgTable2("users", {
  id: integer2("id").primaryKey(),
  username: text2("username").notNull().unique(),
  password: text2("password").notNull(),
  email: text2("email").notNull(),
  telegramId: text2("telegram_id").unique(),
  isAdmin: boolean2("is_admin").notNull().default(false),
  bio: text2("bio"),
  profileColor: text2("profile_color").default("#D7FF00"),
  profilePublic: boolean2("profile_public").default(false),
  showStats: boolean2("show_stats").default(false),
  profilePrivacySettings: jsonb2("profile_privacy_settings").default({}).notNull(),
  goatedLinkRequested: boolean2("goated_link_requested").default(false),
  goatedUsernameRequested: text2("goated_username_requested"),
  goatedAccountLinked: boolean2("goated_account_linked").default(false),
  goatedUsername: text2("goated_username"),
  goatedId: text2("goated_id").unique(),
  createdAt: timestamp2("created_at").default(sql4`CURRENT_TIMESTAMP`),
  lastActive: timestamp2("last_active"),
  lastLogin: timestamp2("last_login"),
  customization: jsonb2("customization").default({}).notNull(),
  profileImage: text2("profile_image"),
  preferences: jsonb2("preferences").default({
    emailNotifications: true,
    telegramNotifications: true,
    marketingEmails: false
  }).notNull(),
  lastPasswordChange: timestamp2("last_password_change"),
  failedLoginAttempts: integer2("failed_login_attempts").default(0),
  accountLocked: boolean2("account_locked").default(false),
  lockoutUntil: timestamp2("lockout_until"),
  twoFactorEnabled: boolean2("two_factor_enabled").default(false),
  emailVerified: boolean2("email_verified").default(false),
  suspiciousActivity: boolean2("suspicious_activity").default(false),
  activityLogs: jsonb2("activity_logs").default([]).notNull()
}, (table) => ({
  goatedIdIdx: index("idx_goated_id").on(table.goatedId),
  userIdIdx: index("idx_user_id").on(table.id)
}));
var userRelations2 = relations2(users2, ({ many }) => ({
  sessions: many(sessions)
}));

// db/schema/bonus.ts
var bonusCodes2 = pgTable3("bonus_codes", {
  id: integer3("id").primaryKey(),
  code: text3("code").notNull().unique(),
  description: text3("description"),
  bonusAmount: text3("bonus_amount").notNull(),
  requiredWager: text3("required_wager"),
  totalClaims: integer3("total_claims").notNull(),
  currentClaims: integer3("current_claims").default(0),
  createdAt: timestamp3("created_at").default(sql5`CURRENT_TIMESTAMP`),
  updatedAt: timestamp3("updated_at").default(sql5`CURRENT_TIMESTAMP`),
  expiresAt: timestamp3("expires_at"),
  status: text3("status").default("active"),
  source: text3("source").default("web"),
  createdBy: integer3("created_by").references(() => users2.id)
});
var bonusCodeClaims = pgTable3("bonus_code_claims", {
  id: integer3("id").primaryKey(),
  userId: integer3("user_id").notNull().references(() => users2.id),
  bonusCodeId: integer3("bonus_code_id").notNull().references(() => bonusCodes2.id),
  claimedAt: timestamp3("claimed_at").default(sql5`CURRENT_TIMESTAMP`),
  wagerCompleted: boolean3("wager_completed").default(false),
  completedAt: timestamp3("completed_at")
});

// server/routes/bonus-challenges.ts
import { eq as eq2, and, gt } from "drizzle-orm";
import { z } from "zod";
import { RateLimiterMemory } from "rate-limiter-flexible";
var router = Router();
var publicLimiter = new RateLimiterMemory({
  points: 60,
  // Number of requests allowed
  duration: 60
  // Time window in seconds
});
var createBonusCodeSchema = z.object({
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  bonusAmount: z.string().min(1, "Bonus amount is required"),
  requiredWager: z.string().optional(),
  totalClaims: z.number().int().positive("Total claims must be a positive number"),
  expiresAt: z.string().datetime("Invalid expiration date"),
  source: z.string().default("web")
});
var updateBonusCodeSchema = z.object({
  description: z.string().optional(),
  bonusAmount: z.string().optional(),
  requiredWager: z.string().optional(),
  totalClaims: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  status: z.enum(["active", "inactive", "expired"]).optional()
});
var authenticate = async (req, res, next) => {
  if (!req.isAuthenticated()) {
    log2("Authentication failed: User not authenticated");
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};
var isAdmin = [authenticate, async (req, res, next) => {
  if (!req.user?.isAdmin) {
    log2(`Unauthorized admin access attempt by user ID: ${req.user?.id}`);
    return res.status(403).json({ error: "Unauthorized access" });
  }
  next();
}];
var asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      log2(`Error in route handler: ${error}`);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors: error.errors.map((err) => err.message)
        });
      }
      res.status(500).json({
        status: "error",
        message: error.message || "Internal server error"
      });
    });
  };
};
router.get("/bonus-codes", asyncHandler(async (req, res) => {
  log2("Fetching active bonus codes - Starting query...");
  try {
    await publicLimiter.consume(req.ip || "unknown");
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-RateLimit-Limit", publicLimiter.points);
    res.setHeader("X-RateLimit-Remaining", (await publicLimiter.get(req.ip || "unknown"))?.remainingPoints || 0);
    const now = /* @__PURE__ */ new Date();
    log2(`Current time for comparison: ${now.toISOString()}`);
    const activeBonusCodes = await db.select().from(bonusCodes2).where(
      and(
        eq2(bonusCodes2.status, "active"),
        gt(bonusCodes2.expiresAt, now)
      )
    );
    log2(`Found ${activeBonusCodes.length} active bonus codes`);
    return res.json({
      status: "success",
      count: activeBonusCodes.length,
      data: activeBonusCodes,
      _meta: {
        timestamp: now.toISOString(),
        filters: {
          status: "active",
          expiresAfter: now.toISOString()
        }
      }
    });
  } catch (error) {
    log2(`Error fetching bonus codes: ${error}`);
    throw error;
  }
}));
router.get("/admin/bonus-codes", isAdmin, asyncHandler(async (_req, res) => {
  log2("Admin: Fetching all bonus codes");
  try {
    const allBonusCodes = await db.select().from(bonusCodes2).orderBy(bonusCodes2.createdAt);
    log2(`Found ${allBonusCodes.length} total bonus codes`);
    res.json(allBonusCodes);
  } catch (error) {
    log2(`Error fetching all bonus codes: ${error}`);
    throw error;
  }
}));
router.post("/admin/bonus-codes", isAdmin, asyncHandler(async (req, res) => {
  log2("Admin: Creating new bonus code");
  try {
    const result = createBonusCodeSchema.safeParse(req.body);
    if (!result.success) {
      log2(`Validation failed: ${JSON.stringify(result.error.issues)}`);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: result.error.issues.map((i) => i.message)
      });
    }
    const { code, description, bonusAmount, requiredWager, totalClaims, expiresAt, source } = result.data;
    const [bonusCode] = await db.insert(bonusCodes2).values({
      code,
      description,
      bonusAmount,
      requiredWager,
      totalClaims,
      expiresAt: new Date(expiresAt),
      source,
      createdBy: req.user.id,
      currentClaims: 0
    }).returning();
    log2(`Created bonus code: ${bonusCode.code}`);
    res.status(201).json(bonusCode);
  } catch (error) {
    log2(`Error creating bonus code: ${error}`);
    throw error;
  }
}));
router.put("/admin/bonus-codes/:id", isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  log2(`Admin: Updating bonus code ${id}`);
  try {
    const result = updateBonusCodeSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: result.error.issues.map((i) => i.message)
      });
    }
    const updateData = {
      ...result.data,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }
    const [updated] = await db.update(bonusCodes2).set(updateData).where(eq2(bonusCodes2.id, parseInt(id))).returning();
    if (!updated) {
      log2(`Bonus code ${id} not found`);
      return res.status(404).json({ error: "Bonus code not found" });
    }
    log2(`Updated bonus code: ${updated.code}`);
    res.json(updated);
  } catch (error) {
    log2(`Error updating bonus code ${id}: ${error}`);
    throw error;
  }
}));
router.delete("/admin/bonus-codes/:id", isAdmin, asyncHandler(async (req, res) => {
  const { id } = req.params;
  log2(`Admin: Deactivating bonus code ${id}`);
  try {
    const [deactivated] = await db.update(bonusCodes2).set({
      status: "inactive",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(bonusCodes2.id, parseInt(id))).returning();
    if (!deactivated) {
      log2(`Bonus code ${id} not found`);
      return res.status(404).json({ error: "Bonus code not found" });
    }
    log2(`Deactivated bonus code: ${deactivated.code}`);
    res.json({ message: "Bonus code deactivated successfully" });
  } catch (error) {
    log2(`Error deactivating bonus code ${id}: ${error}`);
    throw error;
  }
}));
var bonus_challenges_default = router;

// server/routes/users.ts
import { Router as Router2 } from "express";

// server/config/auth.ts
import { OAuth2Client } from "google-auth-library";
import jwt2 from "jsonwebtoken";
import { z as z2 } from "zod";
var googleTokenSchema = z2.object({
  token: z2.string()
});
var jwtPayloadSchema = z2.object({
  userId: z2.number(),
  email: z2.string().email(),
  isAdmin: z2.boolean()
});
var JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
var googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.APP_URL}/api/auth/google/callback`
});
var verifyToken = (token) => {
  try {
    const decoded = jwt2.verify(token, JWT_SECRET);
    const result = jwtPayloadSchema.safeParse(decoded);
    if (!result.success) {
      throw new Error("Invalid token payload");
    }
    return result.data;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

// server/middleware/auth.ts
import { eq as eq3 } from "drizzle-orm";
var requireAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: AUTH_ERROR_MESSAGES.AUTH_REQUIRED
      });
    }
    const user = await validateAndGetUser(token);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: AUTH_ERROR_MESSAGES.USER_NOT_FOUND
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: AUTH_ERROR_MESSAGES.INVALID_TOKEN
    });
  }
};
async function validateAndGetUser(token) {
  const decoded = verifyToken(token);
  const [user] = await db.select().from(users).where(eq3(users.id, decoded.userId)).limit(1);
  return user;
}

// server/middleware/admin.ts
import "express-session";
var requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({
      status: "error",
      message: AUTH_ERROR_MESSAGES.ADMIN_UNAUTHORIZED
    });
  }
};

// server/routes/users.ts
import { z as z3 } from "zod";

// server/services/userService.ts
import { eq as eq4, or } from "drizzle-orm";
var UserService = class {
  /**
   * Find a user by their ID
   */
  async findUserById(id) {
    const result = await db.query.users.findFirst({
      where: eq4(users.id, parseInt(id, 10))
    });
    return result;
  }
  /**
   * Find a user by their username
   */
  async findUserByUsername(username) {
    const result = await db.query.users.findFirst({
      where: eq4(users.username, username)
    });
    return result;
  }
  /**
   * Find a user by their email
   */
  async findUserByEmail(email) {
    const result = await db.query.users.findFirst({
      where: eq4(users.email, email)
    });
    return result;
  }
  /**
   * Find a user by their Goated ID
   */
  async findUserByGoatedId(goatedId) {
    const result = await db.query.users.findFirst({
      where: eq4(users.goatedId, goatedId)
    });
    return result;
  }
  /**
   * Find a user by their email verification token
   */
  async findUserByVerificationToken(token) {
    const result = await db.query.users.findFirst({
      where: eq4(users.emailVerificationToken, token)
    });
    return result;
  }
  /**
   * Create a new user
   */
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  /**
   * Update a user
   */
  async updateUser(id, userData) {
    const [updatedUser] = await db.update(users).set({ ...userData, lastActive: /* @__PURE__ */ new Date() }).where(eq4(users.id, parseInt(id, 10))).returning();
    if (userData.wageredToday !== void 0 || userData.wageredThisWeek !== void 0 || userData.wageredThisMonth !== void 0 || userData.wageredAllTime !== void 0) {
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cacheService(), cacheService_exports));
      cacheService2.invalidate("current_race");
      cacheService2.invalidate("previous_race");
      cacheService2.invalidate("leaderboard_top_performers");
    }
    return updatedUser;
  }
  /**
   * Delete a user
   */
  async deleteUser(id) {
    await db.delete(users).where(eq4(users.id, parseInt(id, 10)));
  }
  /**
   * Search users by username or email
   */
  async searchUsers(query, limit = 10) {
    const formattedQuery = `%${query.toLowerCase()}%`;
    const results = await db.query.users.findMany({
      where: or(
        eq4(users.username, formattedQuery),
        eq4(users.email, formattedQuery),
        eq4(users.goatedId, query)
      ),
      limit
    });
    return results;
  }
  /**
   * Generate a verification token
   */
  generateVerificationToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
  /**
   * Request email verification
   */
  async requestEmailVerification(userId) {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.email) {
      throw new Error("User has no email address");
    }
    if (user.emailVerified) {
      throw new Error("Email is already verified");
    }
    const token = this.generateVerificationToken();
    await this.updateUser(userId, {
      emailVerificationToken: token,
      emailVerificationSentAt: /* @__PURE__ */ new Date()
    });
    return {
      email: user.email,
      token
    };
  }
  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    const user = await this.findUserByVerificationToken(token);
    if (!user) {
      throw new Error("Invalid verification token");
    }
    if (user.emailVerificationSentAt) {
      const expiryTime = new Date(user.emailVerificationSentAt);
      expiryTime.setHours(expiryTime.getHours() + 24);
      if (/* @__PURE__ */ new Date() > expiryTime) {
        throw new Error("Verification token has expired");
      }
    }
    await this.updateUser(String(user.id), {
      emailVerified: true,
      emailVerifiedAt: /* @__PURE__ */ new Date(),
      emailVerificationToken: null
    });
    return user;
  }
};
var userService = new UserService();
var userService_default = userService;

// server/routes/users.ts
import { RateLimiterMemory as RateLimiterMemory2 } from "rate-limiter-flexible";
var router2 = Router2();
var publicLimiter2 = new RateLimiterMemory2({ points: 60, duration: 60 });
var withRateLimit = (handler) => async (req, res, next) => {
  try {
    await publicLimiter2.consume(req.ip || "unknown");
    return handler(req, res, next);
  } catch (err) {
    return res.status(429).json({ error: "Too many requests" });
  }
};
var errorHandler = (err, req, res, next) => {
  console.error("Error in user routes:", err);
  const status = err.status || 500;
  const message = err.message || "An unexpected error occurred";
  res.status(status).json({
    error: {
      status,
      message
    }
  });
};
router2.get("/search", withRateLimit(async (req, res, next) => {
  try {
    const query = req.query.username;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    if (!query || query.length < 2) {
      return res.status(400).json({ error: "Search query must be at least 2 characters" });
    }
    const results = await userService_default.searchUsers(query, limit);
    return res.json({ results, pagination: { page, limit } });
  } catch (err) {
    next(err);
  }
}));
router2.get("/:id", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userService_default.findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});
router2.get("/:id/stats", async (req, res, next) => {
  try {
    const userId = req.params.id;
    const stats = await profileService_default.getUserRankings(userId);
    return res.json(stats);
  } catch (err) {
    next(err);
  }
});
router2.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (String(req.user?.id) !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const updateData = req.body;
    const updated = await profileService_default.updateUser(userId, updateData);
    if (!updated) return res.status(404).json({ error: "User not found" });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
});
router2.get("/batch", withRateLimit(async (req, res, next) => {
  try {
    const idsString = req.query.ids;
    if (!idsString) return res.status(400).json({ error: "No user IDs provided" });
    const ids = idsString.split(",");
    const results = await userService_default.findUsersByIds(ids);
    return res.json(results);
  } catch (err) {
    next(err);
  }
}));
router2.get("/admin/all", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const users3 = await userService_default.getAllUsers();
    return res.json(users3);
  } catch (err) {
    next(err);
  }
});
router2.post("/ensure-profile", async (req, res, next) => {
  try {
    const schema = z3.object({
      userId: z3.string()
    });
    const { userId } = schema.parse(req.body);
    const result = await ensureUserProfile(userId);
    if (!result) {
      return res.status(404).json({
        success: false,
        error: "Could not find or create user profile"
      });
    }
    res.json({
      success: true,
      id: result.id,
      username: result.username,
      goatedId: result.goatedId,
      isNewlyCreated: result.isNewlyCreated
    });
  } catch (error) {
    next(error);
  }
});
router2.use(errorHandler);
var users_default = router2;

// server/routes/goombas-admin.ts
import { Router as Router3 } from "express";
import { RateLimiterMemory as RateLimiterMemory3 } from "rate-limiter-flexible";
var router3 = Router3();
var loginLimiter = new RateLimiterMemory3({ points: 10, duration: 60 });
var withLoginRateLimit = (handler) => async (req, res, next) => {
  try {
    await loginLimiter.consume(req.ip || "unknown");
    return handler(req, res, next);
  } catch (err) {
    return res.status(429).json({ error: "Too many login attempts" });
  }
};
router3.post("/admin", withLoginRateLimit(async (req, res, next) => {
  try {
    const { username, password, secretKey } = req.body;
    if (!username || !password || !secretKey) {
      return res.status(400).json({ message: "Missing credentials", status: "error" });
    }
    const isValid = validateAdminCredentials(username, password, secretKey);
    if (isValid) {
      setAdminSession(req);
      return res.status(200).json({ message: "Authentication successful", status: "success" });
    } else {
      return res.status(401).json({ message: "Invalid credentials", status: "error" });
    }
  } catch (err) {
    next(err);
  }
}));
router3.post("/admin/logout", requireAdmin, async (req, res, next) => {
  try {
    clearAdminSession(req);
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error during logout", status: "error" });
      }
      res.status(200).json({ message: "Logout successful", status: "success" });
    });
  } catch (err) {
    next(err);
  }
});
router3.get("/admin/analytics", requireAdmin, async (req, res, next) => {
  try {
    return res.status(501).json({ message: "Not implemented. Move logic to adminService." });
  } catch (err) {
    next(err);
  }
});
router3.get("/admin/users", requireAdmin, async (req, res, next) => {
  try {
    const users3 = await userService_default.getAllUsers();
    return res.status(200).json(users3);
  } catch (err) {
    next(err);
  }
});
router3.get("/admin/users/:id", requireAdmin, async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await userService_default.findUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found", status: "error" });
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});
router3.get("/admin/auth-status", (req, res) => {
  if (req.session.isAdmin) {
    res.status(200).json({ isAdmin: true, status: "success" });
  } else {
    res.status(401).json({ isAdmin: false, status: "error" });
  }
});
var goombas_admin_default = router3;

// server/routes/account-linking.ts
import { Router as Router4 } from "express";
import { RateLimiterMemory as RateLimiterMemory4 } from "rate-limiter-flexible";
var router4 = Router4();
var postLimiter = new RateLimiterMemory4({ points: 30, duration: 60 });
var withPostRateLimit = (handler) => async (req, res, next) => {
  try {
    await postLimiter.consume(req.ip || "unknown");
    return handler(req, res, next);
  } catch (err) {
    return res.status(429).json({ error: "Too many requests" });
  }
};
router4.post("/request-link", requireAuth, withPostRateLimit(async (req, res, next) => {
  try {
    const { goatedUsername, privacySettings } = req.body;
    const userId = String(req.user.id);
    const result = await profileService_default.requestGoatedAccountLink(userId, goatedUsername, privacySettings);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}));
router4.post("/unlink-account", requireAuth, withPostRateLimit(async (req, res, next) => {
  try {
    const userId = String(req.user.id);
    const result = await profileService_default.unlinkGoatedAccount(userId);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}));
router4.get("/check-goated-username/:username", requireAuth, async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await profileService_default.checkGoatedUsername(username);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
router4.post("/admin-approve-link", requireAuth, requireAdmin, withPostRateLimit(async (req, res, next) => {
  try {
    const { userId, goatedId } = req.body;
    const adminUsername = req.user.username;
    const updatedUser = await profileService_default.approveGoatedAccountLink(userId, goatedId, adminUsername);
    return res.json({ success: true, message: `Account link approved for ${updatedUser.username}`, user: updatedUser });
  } catch (err) {
    next(err);
  }
}));
router4.post("/admin-reject-link", requireAuth, requireAdmin, withPostRateLimit(async (req, res, next) => {
  try {
    const { userId, reason } = req.body;
    const adminUsername = req.user.username;
    const result = await profileService_default.rejectGoatedAccountLink(userId, reason || "Rejected by admin", adminUsername);
    return res.json(result);
  } catch (err) {
    next(err);
  }
}));
var account_linking_default = router4;

// server/routes/apiRoutes.ts
init_goatedApiService();
init_cacheService();
import { Router as Router5 } from "express";

// server/services/raceService.ts
import { desc } from "drizzle-orm";
var RaceService = class {
  /**
   * Get current wager race data - simple and direct
   */
  async getCurrentRace() {
    try {
      console.log("RaceService: Fetching current race data from database");
      const topUsers = await db.select().from(leaderboardUsers).orderBy(desc(leaderboardUsers.wager_month)).limit(10);
      console.log(`RaceService: Found ${topUsers.length} top users`);
      const participants = topUsers.map((user, index2) => ({
        uid: user.uid,
        name: user.name,
        wagered: {
          today: parseFloat(user.wager_today || "0"),
          this_week: parseFloat(user.wager_week || "0"),
          this_month: parseFloat(user.wager_month || "0"),
          all_time: parseFloat(user.wager_all_time || "0")
        },
        rank: index2 + 1
      }));
      const now = /* @__PURE__ */ new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        id: `race-${now.getFullYear()}-${now.getMonth() + 1}`,
        name: `${startOfMonth.toLocaleString("default", { month: "long" })} ${now.getFullYear()} Wager Race`,
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        duration: Math.ceil((endOfMonth.getTime() - startOfMonth.getTime()) / (1e3 * 60 * 60 * 24)),
        status: "live",
        participants
      };
    } catch (error) {
      console.error("RaceService: Error fetching current race:", error);
      throw error;
    }
  }
  /**
   * Get user's position in current race
   */
  async getUserRacePosition(uid) {
    try {
      const allUsers = await db.select().from(leaderboardUsers).orderBy(desc(leaderboardUsers.wager_month));
      const userIndex = allUsers.findIndex((user) => user.uid === uid);
      if (userIndex === -1) {
        return {
          position: null,
          isInTop10: false,
          wageredThisRace: 0,
          raceRemaining: this.getRaceTimeRemaining()
        };
      }
      const position = userIndex + 1;
      const userWagered = parseFloat(allUsers[userIndex].wager_month || "0");
      return {
        position,
        isInTop10: position <= 10,
        wageredThisRace: userWagered,
        raceRemaining: this.getRaceTimeRemaining()
      };
    } catch (error) {
      console.error(`RaceService: Error getting position for ${uid}:`, error);
      throw error;
    }
  }
  /**
   * Get previous race data (simplified)
   */
  async getPreviousRace() {
    const now = /* @__PURE__ */ new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      id: `race-${now.getFullYear()}-${now.getMonth()}`,
      name: `${prevMonth.toLocaleString("default", { month: "long" })} ${now.getFullYear()} Wager Race`,
      startDate: prevMonth.toISOString(),
      endDate: endPrevMonth.toISOString(),
      duration: Math.ceil((endPrevMonth.getTime() - prevMonth.getTime()) / (1e3 * 60 * 60 * 24)),
      status: "completed",
      participants: []
    };
  }
  /**
   * Calculate time remaining in current month (in seconds)
   */
  getRaceTimeRemaining() {
    const now = /* @__PURE__ */ new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const remaining = Math.max(0, Math.floor((endOfMonth.getTime() - now.getTime()) / 1e3));
    return remaining;
  }
};
var raceService_default = new RaceService();

// server/services/leaderboardSyncService.ts
init_goatedApiService();
async function syncLeaderboardUsers() {
  console.log("LeaderboardSyncService: Starting sync...");
  const startTime = Date.now();
  try {
    const rawData = await goatedApiService_default.fetchReferralData();
    if (!rawData || !rawData.data) {
      throw new Error("No data from external API");
    }
    let users3 = [];
    if (Array.isArray(rawData.data)) {
      users3 = rawData.data;
    } else if (rawData.data.data && Array.isArray(rawData.data.data)) {
      users3 = rawData.data.data;
    } else {
      throw new Error("Unexpected API response format");
    }
    console.log(`LeaderboardSyncService: Processing ${users3.length} users`);
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    for (const user of users3) {
      if (!user.uid || !user.name) {
        console.warn(`Skipping user with missing uid or name:`, user);
        continue;
      }
      try {
        await db.insert(leaderboardUsers).values({
          uid: user.uid,
          name: user.name,
          wager_today: String(user.wagered?.today || 0),
          wager_week: String(user.wagered?.this_week || 0),
          wager_month: String(user.wagered?.this_month || 0),
          wager_all_time: String(user.wagered?.all_time || 0),
          updated_at: /* @__PURE__ */ new Date()
        }).onConflictDoUpdate({
          target: leaderboardUsers.uid,
          set: {
            name: user.name,
            wager_today: String(user.wagered?.today || 0),
            wager_week: String(user.wagered?.this_week || 0),
            wager_month: String(user.wagered?.this_month || 0),
            wager_all_time: String(user.wagered?.all_time || 0),
            updated_at: /* @__PURE__ */ new Date()
          }
        });
        updated++;
      } catch (error) {
        console.error(`Error upserting user ${user.uid}:`, error);
        unchanged++;
      }
    }
    const duration = Date.now() - startTime;
    console.log(`LeaderboardSyncService: Sync completed in ${duration}ms. Updated: ${updated}, Unchanged: ${unchanged}`);
    return { created, updated, unchanged, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("LeaderboardSyncService: Sync failed:", error);
    throw error;
  }
}

// server/routes/apiRoutes.ts
init_cacheService();
import { desc as desc2, sql as sql6, eq as eq5 } from "drizzle-orm";
import { z as z4 } from "zod";
var router5 = Router5();
router5.get("/affiliate/stats", async (req, res) => {
  try {
    console.log("DEBUG: Serving leaderboard data with database query");
    const allUsers = await db.select().from(leaderboardUsers).orderBy(desc2(leaderboardUsers.wager_month), desc2(leaderboardUsers.wager_all_time)).limit(3e3);
    console.log(`DEBUG: Retrieved ${allUsers.length} users from database`);
    const transformedUsers = allUsers.map((user, index2) => ({
      uid: user.uid,
      name: user.name,
      wagered: {
        today: parseFloat(user.wager_today?.toString() || "0"),
        this_week: parseFloat(user.wager_week?.toString() || "0"),
        this_month: parseFloat(user.wager_month?.toString() || "0"),
        all_time: parseFloat(user.wager_all_time?.toString() || "0")
      },
      rank: index2 + 1
    }));
    const todayData = [...transformedUsers].sort((a, b) => b.wagered.today - a.wagered.today).map((user, index2) => ({ ...user, rank: index2 + 1 }));
    const weeklyData = [...transformedUsers].sort((a, b) => b.wagered.this_week - a.wagered.this_week).map((user, index2) => ({ ...user, rank: index2 + 1 }));
    const monthlyData = [...transformedUsers].sort((a, b) => b.wagered.this_month - a.wagered.this_month).map((user, index2) => ({ ...user, rank: index2 + 1 }));
    const allTimeData = [...transformedUsers].sort((a, b) => b.wagered.all_time - a.wagered.all_time).map((user, index2) => ({ ...user, rank: index2 + 1 }));
    const response = {
      status: "success",
      metadata: {
        totalUsers: allUsers.length,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        cached: false
      },
      data: {
        today: { data: todayData },
        weekly: { data: weeklyData },
        monthly: { data: monthlyData },
        allTime: { data: allTimeData }
      }
    };
    console.log(`DEBUG: Returning leaderboard data with ${allUsers.length} users in correct format`);
    res.json(response);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    res.status(500).json({
      status: "error",
      error: "Failed to fetch leaderboard data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router5.post("/sync/leaderboard", async (req, res, next) => {
  try {
    console.log("Manual leaderboard sync triggered");
    const result = await syncLeaderboardUsers();
    res.json({
      message: "Leaderboard sync completed successfully",
      status: "success",
      result
    });
  } catch (err) {
    console.error("Manual leaderboard sync failed:", err);
    res.status(500).json({
      message: "Leaderboard sync failed",
      status: "error",
      error: err instanceof Error ? err.message : String(err)
    });
  }
});
router5.get("/wager-races/current", async (req, res, next) => {
  try {
    const data = await withCache(
      "current-race",
      async () => await raceService_default.getCurrentRace(),
      { ttl: 3e4, namespace: "races" }
      // 30 seconds TTL
    );
    res.json({
      success: true,
      data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Race data fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch race data"
      }
    });
  }
});
router5.get("/wager-races/previous", async (req, res, next) => {
  try {
    const data = await withCache(
      "previous-race",
      async () => await raceService_default.getPreviousRace(),
      { ttl: 3e4, namespace: "races" }
      // 30 seconds TTL
    );
    res.json({
      success: true,
      data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Previous race data fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch previous race data"
      }
    });
  }
});
router5.get("/wager-race/position", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid || typeof uid !== "string") {
      return res.status(400).json({ error: "User ID (uid) is required" });
    }
    console.log(`Fetching race position for user ${uid}`);
    const positionData = await raceService_default.getUserRacePosition(uid);
    res.json(positionData);
  } catch (error) {
    console.error("Error fetching user race position:", error);
    res.status(500).json({
      error: "Failed to fetch user race position",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
router5.post("/sync/trigger", async (req, res) => {
  try {
    console.log("Manual sync triggered");
    const syncPromise = profileService_default.syncUserProfiles().then((stats) => {
      console.log("Manual sync completed:", stats);
      return stats;
    }).catch((error) => {
      console.error("Manual sync failed:", error);
      throw error;
    });
    cacheService.del("affiliate-stats");
    cacheService.del("current-wager-race");
    cacheService.del("previous-wager-race");
    res.json({
      message: "Sync started successfully",
      status: "running"
    });
    syncPromise.catch(console.error);
  } catch (error) {
    console.error("Error triggering sync:", error);
    res.status(500).json({
      error: "Failed to trigger sync",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
router5.get("/test/goated-raw", async (req, res) => {
  try {
    console.log("Fetching raw Goated API data for testing");
    const rawData = await goatedApiService_default.fetchReferralData();
    res.json({
      message: "Raw Goated API data",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      data: rawData
    });
  } catch (error) {
    console.error("Error fetching raw Goated data:", error);
    res.status(500).json({
      error: "Failed to fetch raw Goated data",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
router5.get("/wager-races/all", async (req, res, next) => {
  try {
    const data = await withCache(
      "all-races",
      async () => await raceService_default.getAllRaces(),
      { ttl: 6e4, namespace: "races" }
      // 1 minute TTL
    );
    res.json({
      success: true,
      data,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("All races fetch error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Failed to fetch all races data"
      }
    });
  }
});
router5.get("/health", async (req, res, next) => {
  try {
    const data = await withCache(
      "health-status",
      async () => ({
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        db: "connected",
        // Add proper DB health check if needed
        telegramBot: "not initialized"
        // Add proper bot status if needed
      }),
      { ttl: 5e3, namespace: "health" }
      // 5 seconds TTL
    );
    res.json(data);
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 500,
        message: error instanceof Error ? error.message : "Health check failed"
      }
    });
  }
});
router5.get("/leaderboard", async (req, res, next) => {
  try {
    const querySchema = z4.object({
      timeframe: z4.enum(["daily", "weekly", "monthly", "all_time"]).default("monthly"),
      limit: z4.coerce.number().int().positive().max(100).default(10),
      page: z4.coerce.number().int().positive().default(1)
    });
    const validationResult = querySchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid query parameters",
        errors: validationResult.error.flatten().fieldErrors
      });
    }
    const { timeframe, limit, page } = validationResult.data;
    const offset = (page - 1) * limit;
    const cacheKey = `leaderboard-${timeframe}-limit-${limit}-page-${page}`;
    const data = await withCache(
      cacheKey,
      async () => {
        let wagerField;
        let wagerColumn;
        let whereCondition;
        switch (timeframe) {
          case "daily":
            wagerField = "wager_today";
            wagerColumn = leaderboardUsers.wager_today;
            break;
          case "weekly":
            wagerField = "wager_week";
            wagerColumn = leaderboardUsers.wager_week;
            break;
          case "all_time":
            wagerField = "wager_all_time";
            wagerColumn = leaderboardUsers.wager_all_time;
            break;
          case "monthly":
          default:
            wagerField = "wager_month";
            wagerColumn = leaderboardUsers.wager_month;
            break;
        }
        if (!wagerColumn) {
          throw new Error("Invalid timeframe specified after validation.");
        }
        const result = await db.select({
          userId: leaderboardUsers.uid,
          username: leaderboardUsers.name,
          wagered: wagerColumn,
          avatarUrl: users.profileImage
        }).from(leaderboardUsers).leftJoin(users, eq5(leaderboardUsers.uid, users.goatedId)).orderBy(desc2(wagerColumn)).limit(limit).offset(offset);
        const totalCountResult = await db.select({ count: sql6`count(*)::int` }).from(leaderboardUsers);
        const total = totalCountResult[0]?.count || 0;
        const entries = result.map((user, index2) => {
          const rawWagered = user.wagered?.toString();
          let parsedWagered = parseFloat(rawWagered || "0");
          if (isNaN(parsedWagered)) {
            parsedWagered = 0;
          }
          return {
            userId: user.userId || "UNKNOWN_USER_ID",
            // Default if null/undefined
            username: user.username || "Unknown User",
            // Default if null/undefined
            wagered: parsedWagered,
            rank: offset + index2 + 1,
            avatarUrl: user.avatarUrl || null,
            won: 0,
            profit: 0,
            isCurrentUser: false
          };
        });
        return {
          entries,
          timeframe,
          total,
          timestamp: Date.now(),
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        };
      },
      { ttl: 6e4, namespace: "leaderboard" }
    );
    res.json({
      status: "success",
      ...data
    });
  } catch (error) {
    console.error("Error fetching unified leaderboard data:", error);
    if (error instanceof z4.ZodError) {
      return res.status(400).json({
        status: "error",
        message: "Validation error in leaderboard",
        errors: error.flatten().fieldErrors
      });
    }
    res.status(500).json({
      status: "error",
      error: "Failed to fetch leaderboard data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router5.get("/race-config", async (req, res) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const startDate = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const nextRaceStartDate = new Date(currentYear, currentMonth + 1, 1, 0, 0, 0, 0);
    let prizePoolValue = 500;
    if (typeof prizePoolValue !== "number" || isNaN(prizePoolValue)) {
      prizePoolValue = 0;
    }
    const raceConfig = {
      name: "Monthly Goated Race",
      description: "Compete with other Goats by wagering the most throughout the month to win cash prizes!",
      prizePool: prizePoolValue,
      currency: "USD",
      timeframe: "monthly",
      // Could be more dynamic later, e.g., specific race ID
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      nextRaceStartDate: nextRaceStartDate.toISOString(),
      status: now >= startDate && now <= endDate ? "active" : now < startDate ? "upcoming" : "ended",
      prizeDistribution: {
        1: 0.425,
        // $212.50
        2: 0.2,
        // $100
        3: 0.15,
        // $75 - corrected from $60
        4: 0.075,
        // $37.50 - corrected from $30
        5: 0.06,
        // $30 - corrected from $24
        6: 0.04,
        // $20 - corrected from $16
        7: 0.0275,
        // $13.75 - corrected from $11
        8: 0.0225,
        // $11.25 - corrected from $9
        9: 0.0175,
        // $8.75 - corrected from $7
        10: 0.0175
        // $8.75 - corrected from $7
      },
      totalWinners: 10
    };
    res.json({
      success: true,
      data: raceConfig,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  } catch (error) {
    console.error("Error fetching race configuration:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch race configuration",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var apiRoutes_default = router5;

// server/routes.ts
init_cacheService();
import { eq as eq6 } from "drizzle-orm";
import { z as z5 } from "zod";
function log3(message, source) {
  if (typeof message === "object") {
    log2(JSON.stringify(message), source);
  } else {
    log2(message, source);
  }
}
var rateLimits = {
  HIGH: { points: 30, duration: 60 },
  MEDIUM: { points: 15, duration: 60 },
  LOW: { points: 5, duration: 60 }
};
var rateLimiters = {
  high: new RateLimiterMemory5(rateLimits.HIGH),
  medium: new RateLimiterMemory5(rateLimits.MEDIUM),
  low: new RateLimiterMemory5(rateLimits.LOW)
};
var createRateLimiter = (tier) => {
  const limiter = rateLimiters[tier];
  return async (req, res, next) => {
    try {
      const rateLimitRes = await limiter.consume(req.ip);
      res.setHeader("X-RateLimit-Limit", rateLimits[tier.toUpperCase()].points);
      res.setHeader("X-RateLimit-Remaining", rateLimitRes.remainingPoints);
      res.setHeader("X-RateLimit-Reset", new Date(Date.now() + rateLimitRes.msBeforeNext).toISOString());
      next();
    } catch (rejRes) {
      const rejection = rejRes;
      res.setHeader("Retry-After", Math.ceil(rejection.msBeforeNext / 1e3));
      res.setHeader("X-RateLimit-Reset", new Date(Date.now() + rejection.msBeforeNext).toISOString());
      res.status(429).json({
        status: "error",
        message: "Too many requests",
        retryAfter: Math.ceil(rejection.msBeforeNext / 1e3)
      });
    }
  };
};
var cacheMiddleware = (ttl = 3e4, namespace = "api") => async (req, res, next) => {
  const key = `${req.method}-${req.originalUrl}-${JSON.stringify(req.query)}`;
  const { data, found, stale } = cacheService.get(key, { namespace, ttl, staleWhileRevalidate: true });
  if (found) {
    if (res.headersSent) {
      console.log(`Headers already sent in cacheMiddleware for ${key}, skipping cache response`);
      return;
    }
    res.setHeader("X-Cache", stale ? "STALE" : "HIT");
    if (stale && !cacheService.isRefreshing(key, namespace)) {
      cacheService.markRefreshing(key, namespace);
      const resCopy = {
        json: (body) => {
          cacheService.set(key, body, { namespace, ttl });
          cacheService.markRefreshComplete(key, namespace);
          return body;
        },
        status: () => resCopy,
        send: () => {
        },
        end: () => {
        }
      };
      try {
        const originalJson2 = res.json;
        res.json = resCopy.json;
        await new Promise((resolve) => {
          next();
          resolve(void 0);
        });
        res.json = originalJson2;
      } catch (error) {
        console.error("Background refresh error:", error);
        cacheService.markRefreshComplete(key, namespace);
      }
    }
    if (!res.headersSent) {
      return res.json(data);
    } else {
      console.log(`Headers sent during cache middleware processing for ${key}`);
    }
  }
  res.setHeader("X-Cache", "MISS");
  const originalJson = res.json;
  res.json = (body) => {
    cacheService.set(key, body, { namespace, ttl });
    return originalJson.call(res, body);
  };
  next();
};
var router6 = Router6();
router6.use(compression());
var CACHE_TIMES = {
  SHORT: 15e3,
  // 15 seconds
  MEDIUM: 6e4,
  // 1 minute
  LONG: 3e5,
  // 5 minutes
  VERY_LONG: 9e5
  // 15 minutes
};
router6.get("/health", async (_req, res) => {
  try {
    await db.execute(sql7`SELECT 1`);
    const health = {
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      db: "connected",
      telegramBot: "not initialized"
      //removed global.botInstance check
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: process.env.NODE_ENV === "production" ? "Health check failed" : error instanceof Error ? error.message : String(error)
    });
  }
});
router6.get("/sync-profiles", requireAdmin, async (_req, res) => {
  try {
    const goatedApiService = await Promise.resolve().then(() => (init_goatedApiService(), goatedApiService_exports)).then((module) => module.default);
    console.log("Manually triggered profile sync started");
    const result = await goatedApiService.syncUserProfiles();
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
function setupAPIRoutes(app) {
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api", apiRoutes_default);
  app.use("/api/bonus", bonus_challenges_default);
  app.use("/api/users", users_default);
  app.use("/users", users_default);
  app.use("/api/account", account_linking_default);
  app.use("/api", router6);
  app.use("/admin", goombas_admin_default);
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy" });
  });
  app.post("/api/batch", createRateLimiter("medium"), batchHandler);
  app.post("/api/create-test-users", async (_req, res) => {
    try {
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
          const existingUser = await db.select().from(users).where(sql7`username = ${user.username}`).limit(1);
          if (existingUser && existingUser.length > 0) {
            existingCount++;
            continue;
          }
          const randomId = 1e3 + Math.floor(Math.random() * 9e3);
          await db.execute(sql7`
            INSERT INTO users (
              id, username, email, password, created_at, 
              profile_color, bio, is_admin, email_verified
            ) VALUES (
              ${randomId}, ${user.username}, ${user.email}, '', ${/* @__PURE__ */ new Date()}, 
              ${user.profileColor}, 'Test user bio', false, true
            )
          `);
          createdCount++;
          console.log(`Created test user: ${user.username} with ID ${randomId}`);
        } catch (err) {
          const insertError = err;
          console.error(`Error creating test user ${user.username}:`, insertError);
          errors.push(`Failed to create ${user.username}: ${insertError.message || "Unknown error"}`);
        }
      }
      res.json({
        success: true,
        message: `Created ${createdCount} test users, ${existingCount} already existed`,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Error creating test users:", error);
      res.status(500).json({
        error: "Failed to create test users",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app.get(
    "/goated-supervisor/analytics",
    requireAdmin,
    // Ensure admin middleware is applied
    createRateLimiter("low"),
    cacheMiddleware(CACHE_TIMES.LONG),
    async (_req, res) => {
      let responseHasBeenSent = false;
      try {
        if (res.headersSent) {
          responseHasBeenSent = true;
          return;
        }
        log3("Fetching leaderboard data for analytics...");
        const leaderboardData = await statSyncService_default.getLeaderboardData();
        const allUsers = [
          ...leaderboardData.data?.today?.data || [],
          ...leaderboardData.data?.weekly?.data || [],
          ...leaderboardData.data?.monthly?.data || [],
          ...leaderboardData.data?.all_time?.data || []
        ];
        const uniqueUsers = Array.from(new Set(allUsers.map((user) => user.uid))).map((uid) => allUsers.find((user) => user.uid === uid)).filter(Boolean);
        const totals = uniqueUsers.reduce((acc, entry) => {
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
          db.select({ count: sql7`count(*)` }).from(wagerRaces),
          db.select({ count: sql7`count(*)` }).from(wagerRaces).where(eq6(wagerRaces.status, "live"))
        ]);
        const stats = {
          totalRaces: raceCount[0].count,
          activeRaces: activeRaceCount[0].count,
          wagerTotals: totals,
          userCount: uniqueUsers.length
        };
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.json(stats);
        }
      } catch (error) {
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
  app.get(
    "/api/wheel/check-eligibility",
    createRateLimiter("high"),
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            status: "error",
            message: "Authentication required"
          });
        }
        const [lastSpin] = await db.select({ timestamp: sql7`MAX(timestamp)` }).from(sql7`wheel_spins`).where(sql7`user_id = ${req.user.id}`).limit(1);
        const now = /* @__PURE__ */ new Date();
        const lastSpinDate = lastSpin?.timestamp ? new Date(lastSpin.timestamp) : null;
        const canSpin = !lastSpinDate || (now.getUTCDate() !== lastSpinDate.getUTCDate() || now.getUTCMonth() !== lastSpinDate.getUTCMonth() || now.getUTCFullYear() !== lastSpinDate.getUTCFullYear());
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
  app.post(
    "/api/wheel/record-spin",
    createRateLimiter("medium"),
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
          sql7`INSERT INTO wheel_spins (user_id, segment_index, reward_code, timestamp)
              VALUES (${req.user.id}, ${segmentIndex}, ${reward}, NOW())`
        );
        if (reward) {
          await db.execute(
            sql7`INSERT INTO bonus_codes (code, user_id, claimed_at, expires_at)
                VALUES (${reward}, ${req.user.id}, NOW(), NOW() + INTERVAL '24 hours')`
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
  app.get(
    "/goated-supervisor/transformation-metrics",
    requireAdmin,
    createRateLimiter("medium"),
    cacheMiddleware(CACHE_TIMES.LONG),
    async (_req, res) => {
      let responseHasBeenSent = false;
      try {
        if (res.headersSent) {
          responseHasBeenSent = true;
          return;
        }
        console.log("Executing transformation metrics query...");
        const result = await db.query.transformationLogs.findMany({
          columns: {
            type: true,
            duration_ms: true,
            created_at: true
          },
          where: sql7`created_at > NOW() - INTERVAL '24 hours'`
        });
        console.log("Raw query result:", result);
        const metrics = {
          total_transformations: result.length,
          average_time_ms: result.reduce((acc, row) => acc + (Number(row.duration_ms) || 0), 0) / (result.length || 1),
          error_count: result.filter((row) => row.type === "error").length,
          last_updated: result.length > 0 ? Math.max(...result.map((row) => row.created_at.getTime())) : Date.now()
        };
        console.log("Calculated metrics:", metrics);
        const response = {
          status: "success",
          data: {
            totalTransformations: metrics.total_transformations,
            averageTimeMs: Number(metrics.average_time_ms.toFixed(2)),
            errorRate: metrics.total_transformations > 0 ? Number((metrics.error_count / metrics.total_transformations).toFixed(2)) : 0,
            lastUpdated: new Date(metrics.last_updated).toISOString()
          }
        };
        console.log("Processed response:", response);
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.json(response);
        }
      } catch (error) {
        console.error("Error in transformation metrics endpoint:", {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (!responseHasBeenSent && !res.headersSent) {
          responseHasBeenSent = true;
          return res.status(500).json({
            status: "error",
            message: "Failed to fetch transformation metrics",
            details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : void 0
          });
        }
      }
    }
  );
  app.get(
    "/api/admin/export-logs",
    createRateLimiter("low"),
    async (_req, res) => {
      let responseHasBeenSent = false;
      if (res.headersSent) {
        responseHasBeenSent = true;
        return;
      }
      try {
        console.log("Fetching logs for export...");
        const logs = await db.query.transformationLogs.findMany({
          orderBy: (logs2, { desc: desc4 }) => [desc4(logs2.created_at)],
          limit: 1e3
          // Limit to last 1000 logs
        });
        console.log(`Found ${logs.length} logs to export`);
        const formattedLogs = logs.map((log4) => ({
          timestamp: log4.created_at.toISOString(),
          type: log4.type,
          message: log4.message,
          duration_ms: log4.duration_ms?.toString() || "",
          resolved: log4.resolved ? "Yes" : "No",
          error_message: log4.error_message || "",
          payload: log4.payload ? JSON.stringify(log4.payload) : ""
        }));
        if (!responseHasBeenSent) {
          responseHasBeenSent = true;
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename=transformation_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
          const csvData = [
            // Header row
            Object.keys(formattedLogs[0] || {}).join(","),
            // Data rows
            ...formattedLogs.map(
              (log4) => Object.values(log4).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
            )
          ].join("\n");
          return res.send(csvData);
        }
      } catch (error) {
        console.error("Error exporting logs:", error);
        if (!responseHasBeenSent) {
          responseHasBeenSent = true;
          return res.status(500).json({
            status: "error",
            message: "Failed to export logs",
            details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : void 0
          });
        }
      }
    }
  );
}
function registerRoutes(app) {
  const httpServer = createServer(app);
  setupAPIRoutes(app);
  setupWebSocket(httpServer);
  return httpServer;
}
function setupWebSocket(httpServer) {
  createWebSocketServer(httpServer, "/ws/leaderboard", (ws, _req) => {
    handleLeaderboardConnection(ws);
  });
  createWebSocketServer(httpServer, "/ws/transformation-logs", (ws, _req) => {
    handleTransformationLogsConnection(ws);
  });
}
function handleLeaderboardConnection(ws) {
  const clientId = Date.now().toString();
  log3(`Leaderboard WebSocket client connected (${clientId})`);
  ws.isAlive = true;
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket2.OPEN) {
      ws.ping();
    }
  }, 3e4);
  ws.on("pong", () => {
    ws.isAlive = true;
  });
  ws.on("error", (error) => {
    log3(`WebSocket error (${clientId}): ${error.message}`);
    clearInterval(pingInterval);
    ws.terminate();
  });
  ws.on("close", () => {
    log3(`Leaderboard WebSocket client disconnected (${clientId})`);
    clearInterval(pingInterval);
  });
  if (ws.readyState === WebSocket2.OPEN) {
    ws.send(JSON.stringify({
      type: "CONNECTED",
      clientId,
      timestamp: Date.now()
    }));
  }
}
function handleTransformationLogsConnection(ws) {
  const clientId = Date.now().toString();
  log3(`Transformation logs WebSocket client connected (${clientId})`);
  if (ws.readyState === WebSocket2.OPEN) {
    ws.send(JSON.stringify({
      type: "CONNECTED",
      clientId,
      timestamp: Date.now()
    }));
    db.select().from(transformationLogs).orderBy(sql7`created_at DESC`).limit(50).then((logs) => {
      if (ws.readyState === WebSocket2.OPEN) {
        ws.send(JSON.stringify({
          type: "INITIAL_LOGS",
          logs: logs.map((log4) => ({
            ...log4,
            timestamp: log4.created_at.toISOString()
          }))
        }));
      }
    }).catch((error) => {
      console.error("Error fetching initial logs:", error);
    });
  }
  ws.isAlive = true;
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket2.OPEN) {
      ws.ping();
    }
  }, 3e4);
  ws.on("pong", () => {
    ws.isAlive = true;
  });
  ws.on("close", () => {
    clearInterval(pingInterval);
    log3(`Transformation logs WebSocket client disconnected (${clientId})`);
  });
  ws.on("error", (error) => {
    log3(`WebSocket error (${clientId}): ${error.message}`);
    clearInterval(pingInterval);
    ws.terminate();
  });
}
var batchHandler = async (req, res) => {
  try {
    const { requests } = req.body;
    if (!Array.isArray(requests)) {
      return res.status(400).json({ error: "Invalid batch request format" });
    }
    const results = await Promise.allSettled(
      requests.map(async (request) => {
        try {
          const response = await fetch(
            `${API_CONFIG.baseUrl}${request.endpoint}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
                "Content-Type": "application/json"
              },
              signal: AbortSignal.timeout(6e4)
              // 60 seconds timeout
            }
          );
          if (!response.ok) {
            throw new ApiError(`API Error: ${response.status}`, { status: response.status });
          }
          return await response.json();
        } catch (error) {
          const apiError = error;
          return {
            status: "error",
            error: apiError.message || "Failed to process request",
            endpoint: request.endpoint
          };
        }
      })
    );
    res.json({
      status: "success",
      results: results.map(
        (result) => result.status === "fulfilled" ? result.value : result.reason
      )
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Batch processing failed",
      error: error.message
    });
  }
};
var wheelSpinSchema = z5.object({
  segmentIndex: z5.number(),
  reward: z5.string().nullable()
});
var ApiError = class extends Error {
  constructor(message, options) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
  }
};

// server/middleware/domain-handler.ts
function domainRedirectMiddleware(req, res, next) {
  if (req.path.startsWith("/goombas.net")) {
    req.isGoombasDomain = true;
  }
  next();
}

// server/utils/error.ts
var AppError = class extends Error {
  /**
   * Create a new application error
   * @param code HTTP status code
   * @param message User-friendly error message
   * @param context Additional context for debugging (not exposed to clients)
   */
  constructor(code, message, context) {
    super(message);
    this.code = code;
    this.message = message;
    this.context = context;
    this.name = "AppError";
  }
};
var formatErrorResponse = (error, defaultMessage = "An unexpected error occurred") => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    };
  }
  return {
    success: false,
    error: {
      code: 500,
      message: error.message || defaultMessage
    }
  };
};

// server/middleware/error-handler.ts
function errorHandler2(err, req, res, next) {
  log(`Error: ${err.message} - ${req.method} ${req.path}`, "error-handler");
  console.error("Error details:", {
    path: req.path,
    method: req.method,
    error: err instanceof AppError ? {
      code: err.code,
      context: err.context
    } : err
  });
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof AppError) {
    return res.status(err.code).json(formatErrorResponse(err));
  }
  return res.status(500).json(formatErrorResponse(err, "An unexpected server error occurred"));
}
function notFoundHandler(req, res) {
  log(`404 Not Found: ${req.method} ${req.path}`, "not-found-handler");
  return res.status(404).json({
    success: false,
    error: {
      code: 404,
      message: "The requested resource was not found"
    }
  });
}

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { randomBytes } from "crypto";
import { eq as eq7 } from "drizzle-orm";
import { RateLimiterMemory as RateLimiterMemory6 } from "rate-limiter-flexible";
var authLimiter = new RateLimiterMemory6({
  points: 20,
  // 20 attempts
  duration: 60 * 5,
  // per 5 minutes
  blockDuration: 60 * 2
  // Block for 2 minutes
});
function setupAuth(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const [user] = await db.select().from(users).where(eq7(users.id, id)).limit(1);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        if (username === process.env.ADMIN_USERNAME) {
          if (password === process.env.ADMIN_PASSWORD) {
            const adminUser = {
              id: 1,
              username: process.env.ADMIN_USERNAME || "admin",
              password: "",
              // Password already verified
              email: `${process.env.ADMIN_USERNAME || "admin"}@admin.local`,
              isAdmin: true,
              createdAt: /* @__PURE__ */ new Date(),
              emailVerified: true
            };
            return done(null, adminUser);
          } else {
            return done(null, false, { message: "Invalid admin password" });
          }
        }
        if (!username || !password) {
          return done(null, false, { message: "Username and password are required" });
        }
        const sanitizedUsername = username.trim().toLowerCase();
        const sanitizedPassword = password.trim();
        if (!sanitizedUsername || !sanitizedPassword) {
          return done(null, false, { message: "Username and password cannot be empty" });
        }
        const [user] = await db.select().from(users).where(eq7(users.username, sanitizedUsername)).limit(1);
        if (!user) {
          return done(null, false, { message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS });
        }
        const isMatch = await verifyPassword(sanitizedPassword, user.password);
        if (!isMatch) {
          return done(null, false, { message: AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  app.post("/api/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        const errors = result.error.issues.map((i) => i.message).join(", ");
        return res.status(400).json({
          status: "error",
          message: "Validation failed",
          errors
        });
      }
      try {
        await authLimiter.consume(req.ip || "unknown");
      } catch (error) {
        return res.status(429).json({
          status: "error",
          message: "Too many attempts. Please try again later."
        });
      }
      const { username, password, email } = result.data;
      const sanitizedUsername = username.trim().toLowerCase();
      const [existingUsername] = await db.select().from(users).where(eq7(users.username, sanitizedUsername)).limit(1);
      if (existingUsername) {
        return res.status(400).json({
          status: "error",
          message: "Username already exists"
        });
      }
      const preparedPassword = await preparePassword(password);
      const emailVerificationToken = randomBytes(32).toString("hex");
      const [newUser] = await db.insert(users).values({
        username: sanitizedUsername,
        password: preparedPassword,
        email: email.toLowerCase(),
        isAdmin: false,
        emailVerificationToken,
        emailVerified: false
      }).returning();
      console.log("Email verification skipped for testing");
      req.login(newUser, (err) => {
        if (err) {
          console.error("Login after registration failed:", err);
          return res.status(500).json({
            status: "error",
            message: "Registration successful but login failed"
          });
        }
        return res.status(201).json({
          status: "success",
          message: "Registration successful",
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            createdAt: newUser.createdAt
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({
        status: "error",
        message: "Registration failed",
        details: process.env.NODE_ENV === "development" ? error.message : void 0
      });
    }
  });
  app.post("/api/login", async (req, res, next) => {
    try {
      await authLimiter.consume(req.ip || "unknown");
    } catch (error) {
      return res.status(429).json({
        status: "error",
        message: "Too many login attempts. Please try again later."
      });
    }
    if (!req.body?.username || !req.body?.password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required"
      });
    }
    passport.authenticate(
      "local",
      (err, user, info) => {
        if (err) {
          console.error("Authentication error:", err);
          return res.status(500).json({
            status: "error",
            message: "Internal server error"
          });
        }
        if (!user) {
          return res.status(401).json({
            status: "error",
            message: info.message ?? "Invalid credentials"
          });
        }
        req.login(user, (err2) => {
          if (err2) {
            console.error("Login error:", err2);
            return next(err2);
          }
          return res.json({
            status: "success",
            message: "Login successful",
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              isAdmin: user.isAdmin,
              createdAt: user.createdAt
            }
          });
        });
      }
    )(req, res, next);
  });
  app.post("/api/logout", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(400).json({
        status: "error",
        message: "Not logged in"
      });
    }
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          status: "error",
          message: "Logout failed"
        });
      }
      res.json({
        status: "success",
        message: "Logout successful"
      });
    });
  });
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        status: "error",
        message: "Not logged in"
      });
    }
    const user = req.user;
    res.json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  });
}

// server/index.ts
init_api();

// server/config/paths.ts
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
var rootDir = path3.resolve(__dirname3, "..", "..");
var PATHS = {
  // Project structure
  root: rootDir,
  // Client paths
  clientSrc: path3.resolve(rootDir, "client", "src"),
  clientBuild: path3.resolve(rootDir, "dist", "public"),
  clientIndex: path3.resolve(rootDir, "client", "index.html"),
  // Server paths
  serverSrc: path3.resolve(rootDir, "server"),
  // Database paths
  dbSrc: path3.resolve(rootDir, "db"),
  // Utility function to resolve paths relative to root
  resolve: (...segments) => path3.resolve(rootDir, ...segments)
};

// server/config/environment.ts
var NODE_ENV = process.env.NODE_ENV || "development";
var IS_PRODUCTION = NODE_ENV === "production";
var IS_DEVELOPMENT = !IS_PRODUCTION;
var PORT = parseInt(process.env.PORT || "5000", 10);
var BOT_PORT = parseInt(process.env.BOT_PORT || "5001", 10);
var VITE_PORT = parseInt(process.env.VITE_PORT || "5173", 10);
var HOST = process.env.HOST || "0.0.0.0";
var SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key";
var COOKIE_SECURE = IS_PRODUCTION;
var COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1e3;
var CORS_ORIGINS = IS_DEVELOPMENT ? ["http://localhost:5000", "http://0.0.0.0:5000"] : process.env.ALLOWED_ORIGINS?.split(",") || [];
var API_TOKEN = process.env.API_TOKEN;
var GOATED_API_TOKEN = process.env.GOATED_API_TOKEN;
var DATABASE_URL = process.env.DATABASE_URL;
var ENV = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  PORT,
  BOT_PORT,
  VITE_PORT,
  HOST,
  SESSION_SECRET,
  COOKIE_SECURE,
  COOKIE_MAX_AGE,
  CORS_ORIGINS,
  API_TOKEN,
  GOATED_API_TOKEN,
  DATABASE_URL
};

// server/index.ts
import cors from "cors";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { defineConfig as defineConfig2 } from "vite";
import react2 from "@vitejs/plugin-react";
import themePlugin2 from "@replit/vite-plugin-shadcn-theme-json";
import runtimeErrorOverlay2 from "@replit/vite-plugin-runtime-error-modal";
var execAsync = promisify(exec);
var __filename4 = fileURLToPath4(import.meta.url);
var __dirname4 = path4.dirname(__filename4);
var { PORT: PORT2, HOST: HOST2, IS_DEVELOPMENT: IS_DEVELOPMENT2, IS_PRODUCTION: IS_PRODUCTION2, CORS_ORIGINS: CORS_ORIGINS2, SESSION_SECRET: SESSION_SECRET2, COOKIE_SECURE: COOKIE_SECURE2, COOKIE_MAX_AGE: COOKIE_MAX_AGE2, API_TOKEN: API_TOKEN2, GOATED_API_TOKEN: GOATED_API_TOKEN2, DATABASE_URL: DATABASE_URL2 } = ENV;
var templateCache = null;
var server = null;
async function isPortAvailable(port) {
  try {
    await execAsync(`lsof -i:${port}`);
    return false;
  } catch {
    return true;
  }
}
async function waitForPort(port, timeout = 3e4) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      return;
    }
    log("info", `Port ${port} is in use, waiting...`);
    await new Promise((resolve) => setTimeout(resolve, 1e3));
  }
  throw new Error(`Timeout waiting for port ${port}`);
}
async function testDbConnection() {
  try {
    await db.execute(sql8`SELECT 1`);
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}
async function ensureUserProfile(userId) {
  if (!userId) return null;
  console.log(`Ensuring profile exists for ID: ${userId}`);
  try {
    const isNumericId = /^\d+$/.test(userId);
    let existingUser = null;
    try {
      const results = await db.execute(sql8`
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
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }
    } catch (findError) {
      console.log("Error finding user by string ID:", findError);
      existingUser = null;
    }
    try {
      const results = await db.execute(sql8`
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
        return {
          ...existingUser,
          isNewlyCreated: false
        };
      }
    } catch (findError) {
      console.log("Error finding user by Goated ID:", findError);
    }
    if (isNumericId) {
      const token = GOATED_API_TOKEN2 || API_TOKEN2 || API_CONFIG.token;
      let userData = null;
      if (token) {
        try {
          const leaderboardUrl = `https://api.goated.com/user2/affiliate/referral-leaderboard/2RW440E`;
          console.log(`Fetching leaderboard data to find user ${userId}`);
          const response = await fetch(leaderboardUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            signal: AbortSignal.timeout(15e3)
            // Add timeout to prevent hanging requests
          });
          if (response.ok) {
            const leaderboardData = await response.json();
            const timeframes = ["today", "weekly", "monthly", "all_time"];
            for (const timeframe of timeframes) {
              const users3 = leaderboardData?.data?.[timeframe]?.data || [];
              const foundUser = users3.find((user) => user.uid === userId);
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
      const username = userData?.name || null;
      if (userData && username) {
        try {
          const newUserId = Math.floor(1e3 + Math.random() * 9e3);
          const email = `${username.toLowerCase().replace(/[^a-z0-9]/g, "")}@goated.placeholder.com`;
          const result = await db.execute(sql8`
            INSERT INTO users (
              username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_username, goated_account_linked
            ) VALUES (
              ${username}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
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
        try {
          const newUserId = Math.floor(1e3 + Math.random() * 9e3);
          const tempUsername = `User ${userId}`;
          const email = `user_${userId}@placeholder.com`;
          const result = await db.execute(sql8`
            INSERT INTO users (
              username, email, password, created_at, profile_color, 
              bio, is_admin, goated_id, goated_account_linked
            ) VALUES (
              ${tempUsername}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
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
      try {
        const shortId = userId.substring(0, 8);
        const newUserId = Math.floor(1e3 + Math.random() * 9e3);
        const username = `User ${shortId}`;
        const email = `user_${shortId}@placeholder.com`;
        const result = await db.execute(sql8`
          INSERT INTO users (
            username, email, password, created_at, profile_color, 
            bio, is_admin, goated_id, goated_account_linked
          ) VALUES (
            ${username}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
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
async function initializeServer() {
  try {
    log("info", "Starting server initialization...");
    await waitForPort(PORT2);
    log("info", "Port available, proceeding with initialization");
    await testDbConnection();
    log("info", "Database connection established");
    console.log("Starting background data sync...");
    profileService_default.syncUserProfiles().then((stats) => {
      console.log("Initial profile sync completed:", stats);
    }).catch((error) => {
      console.error("Initial profile sync failed:", error);
    });
    const app = express2();
    setupMiddleware(app);
    setupAuth(app);
    registerRoutes(app);
    server = createServer2(app);
    setupWebSocket2(server);
    if (IS_DEVELOPMENT2) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
      app.use("/api", notFoundHandler);
    }
    app.use(errorHandler2);
    log("info", "Admin routes initialized");
    return new Promise((resolve, reject) => {
      server.listen(PORT2, HOST2, () => {
        log("info", `Server is ready at http://0.0.0.0:${PORT2}`);
        console.log(`PORT=${PORT2}`);
        console.log(`PORT_READY=${PORT2}`);
        resolve(server);
      }).on("error", (err) => {
        log("error", `Server failed to start: ${err.message}`);
        reject(err);
      });
      const shutdown = async () => {
        log("info", "Shutting down gracefully...");
        closeAllWebSocketServers();
        log("info", "All WebSocket servers closed");
        server.close(() => {
          log("info", "HTTP server closed");
          process.exit(0);
        });
        setTimeout(() => {
          log("error", "Forced shutdown after timeout");
          process.exit(1);
        }, 1e4);
      };
      process.on("SIGTERM", shutdown);
      process.on("SIGINT", shutdown);
    });
  } catch (error) {
    log("error", `Failed to start application: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}
function setupWebSocket2(server2) {
  createWebSocketServer(server2, "/ws", (ws, _req) => {
    log("info", "New WebSocket connection established");
    ws.on("error", (error) => {
      log("error", `WebSocket error: ${error.message}`);
    });
  });
}
function setupMiddleware(app) {
  app.set("trust proxy", 1);
  app.use(domainRedirectMiddleware);
  app.use("/api", cors({
    origin: CORS_ORIGINS2,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  }));
  const PostgresSessionStore = connectPg(session);
  app.use(session({
    store: new PostgresSessionStore({
      conObject: {
        connectionString: DATABASE_URL2
      },
      createTableIfMissing: true
    }),
    secret: SESSION_SECRET2,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: COOKIE_SECURE2,
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE2
    }
  }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
  app.use(express2.json({ limit: "1mb" }));
  app.use(express2.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestLogger);
  app.use(compression2());
}
var requestLogger = /* @__PURE__ */ (() => {
  const logQueue = [];
  let flushTimeout = null;
  const flushLogs = () => {
    if (logQueue.length > 0) {
      console.log(logQueue.join("\n"));
      logQueue.length = 0;
    }
    flushTimeout = null;
  };
  return (req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) {
        const duration = Date.now() - start;
        logQueue.push(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
        if (!flushTimeout) {
          flushTimeout = setTimeout(flushLogs, 1e3);
        }
      }
    });
    next();
  };
})();
function serveStatic(app) {
  const distPath = PATHS.clientBuild;
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}. Please build the client first.`);
  }
  app.use(express2.static(distPath, {
    setHeaders: (res, filePath) => {
      if (filePath.match(/\.(?:js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        if (filePath.match(/\.[a-f0-9]{8}\.(?:js|css)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      } else {
        res.setHeader("Cache-Control", "no-cache");
      }
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
    etag: true,
    lastModified: true
  }));
  app.get("*", (_req, res, next) => {
    if (_req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path4.resolve(distPath, "index.html"), {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff"
      }
    });
  });
}
var viteConfig = defineConfig2({
  plugins: [react2(), runtimeErrorOverlay2(), themePlugin2()],
  resolve: {
    alias: {
      "@db": path4.resolve(__dirname4, "../db"),
      "@": path4.resolve(__dirname4, "../client/src")
    }
  },
  root: path4.resolve(__dirname4, "../client"),
  build: {
    outDir: path4.resolve(__dirname4, "../dist/public"),
    emptyOutDir: true
  }
});
async function setupVite(app, server2) {
  const viteLogger2 = createLogger2();
  const vite = await createViteServer2({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger2,
      error: (msg, options) => {
        viteLogger2.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      middlewareMode: true,
      hmr: { server: server2 }
    },
    appType: "custom"
  });
  app.use(vite.middlewares);
  const loadTemplate = async () => {
    if (!templateCache) {
      const clientTemplate = path4.resolve(__dirname4, "..", "client", "index.html");
      templateCache = await fs.promises.readFile(clientTemplate, "utf-8");
    }
    return templateCache;
  };
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
      vite.ssrFixStacktrace(error);
      next(error instanceof Error ? error : new Error(String(error)));
    }
  });
}
initializeServer().catch((error) => {
  log("error", `Server startup error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
export {
  ensureUserProfile
};
