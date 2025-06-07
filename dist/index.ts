var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  affiliateStats: () => affiliateStats,
  apiSyncMetadata: () => apiSyncMetadata,
  bonusCodeRelations: () => bonusCodeRelations,
  bonusCodes: () => bonusCodes,
  historicalRaces: () => historicalRaces,
  insertAffiliateStatsSchema: () => insertAffiliateStatsSchema,
  insertApiSyncMetadataSchema: () => insertApiSyncMetadataSchema,
  insertBonusCodeSchema: () => insertBonusCodeSchema,
  insertHistoricalRaceSchema: () => insertHistoricalRaceSchema,
  insertMockWagerDataSchema: () => insertMockWagerDataSchema,
  insertNewsletterSubscriptionSchema: () => insertNewsletterSubscriptionSchema,
  insertSupportTicketSchema: () => insertSupportTicketSchema,
  insertTicketMessageSchema: () => insertTicketMessageSchema,
  insertTransformationLogSchema: () => insertTransformationLogSchema,
  insertUserSchema: () => insertUserSchema,
  insertWagerRaceParticipantSchema: () => insertWagerRaceParticipantSchema,
  insertWagerRaceSchema: () => insertWagerRaceSchema,
  insertWheelSpinSchema: () => insertWheelSpinSchema,
  mockWagerData: () => mockWagerData,
  mockWagerDataRelations: () => mockWagerDataRelations,
  newsletterSubscriptions: () => newsletterSubscriptions,
  notificationPreferences: () => notificationPreferences,
  selectAffiliateStatsSchema: () => selectAffiliateStatsSchema,
  selectApiSyncMetadataSchema: () => selectApiSyncMetadataSchema,
  selectBonusCodeSchema: () => selectBonusCodeSchema,
  selectHistoricalRaceSchema: () => selectHistoricalRaceSchema,
  selectMockWagerDataSchema: () => selectMockWagerDataSchema,
  selectNewsletterSubscriptionSchema: () => selectNewsletterSubscriptionSchema,
  selectSupportTicketSchema: () => selectSupportTicketSchema,
  selectTicketMessageSchema: () => selectTicketMessageSchema,
  selectTransformationLogSchema: () => selectTransformationLogSchema,
  selectUserSchema: () => selectUserSchema,
  selectWagerRaceParticipantSchema: () => selectWagerRaceParticipantSchema,
  selectWagerRaceSchema: () => selectWagerRaceSchema,
  selectWheelSpinSchema: () => selectWheelSpinSchema,
  supportTicketRelations: () => supportTicketRelations,
  supportTickets: () => supportTickets,
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
var users, userRelations, insertUserSchema, selectUserSchema, wheelSpins, bonusCodes, wagerRaces, wagerRaceParticipants, supportTickets, ticketMessages, wheelSpinRelations, bonusCodeRelations, wagerRaceRelations, wagerRaceParticipantRelations, supportTicketRelations, ticketMessageRelations, insertWheelSpinSchema, selectWheelSpinSchema, insertBonusCodeSchema, selectBonusCodeSchema, insertWagerRaceSchema, selectWagerRaceSchema, insertWagerRaceParticipantSchema, selectWagerRaceParticipantSchema, insertSupportTicketSchema, selectSupportTicketSchema, insertTicketMessageSchema, selectTicketMessageSchema, historicalRaces, newsletterSubscriptions, notificationPreferences, affiliateStats, mockWagerData, mockWagerDataRelations, transformationLogs, apiSyncMetadata, insertNewsletterSubscriptionSchema, selectNewsletterSubscriptionSchema, insertHistoricalRaceSchema, selectHistoricalRaceSchema, insertAffiliateStatsSchema, selectAffiliateStatsSchema, insertMockWagerDataSchema, selectMockWagerDataSchema, insertTransformationLogSchema, selectTransformationLogSchema, insertApiSyncMetadataSchema, selectApiSyncMetadataSchema;
var init_schema = __esm({
  "db/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      // Primary identification
      id: serial("id").primaryKey(),
      // Internal user ID
      username: text("username").notNull().unique(),
      // Display name (from Goated or local registration)
      // Goated.com Integration Fields
      uid: text("uid").unique(),
      // Goated.com UID
      // Wager statistics from Goated.com API
      total_wager: decimal("total_wager", { precision: 18, scale: 8 }).default("0").notNull(),
      // All-time wagered amount
      wager_today: decimal("wager_today", { precision: 18, scale: 8 }).default("0").notNull(),
      // Today's wagered amount
      wager_week: decimal("wager_week", { precision: 18, scale: 8 }).default("0").notNull(),
      // This week's wagered amount
      wager_month: decimal("wager_month", { precision: 18, scale: 8 }).default("0").notNull(),
      // Monthly wagered amount
      verified: boolean("verified").default(false).notNull(),
      // If Goated.com identity is verified
      // Authentication and account fields
      password: text("password").notNull(),
      // Password (may be empty for API-created accounts)
      email: text("email").notNull().unique(),
      // Email address
      isAdmin: boolean("is_admin").default(false).notNull(),
      // Admin privileges
      emailVerified: boolean("email_verified").default(false),
      // Email verification status
      // Profile and customization
      bio: text("bio"),
      // User biography
      profileColor: text("profile_color").default("#D7FF00"),
      // Profile color preference
      // Legacy fields - maintained for backward compatibility
      goatedId: text("goated_id").unique(),
      // Legacy - Same as uid for Goated users
      goatedUsername: text("goated_username"),
      // Legacy - Same as username for Goated users
      goatedAccountLinked: boolean("goated_account_linked").default(false),
      // Legacy - Same as verified
      // Timestamps and activity tracking
      createdAt: timestamp("created_at").defaultNow().notNull(),
      // Account creation time
      lastActive: timestamp("last_active"),
      // Last activity timestamp
      isActive: boolean("is_active").default(false).notNull()
      // Determined by wager activity (total_wager > 0)
    });
    userRelations = relations(users, ({ many }) => ({
      // Keep only core relations
      wheelSpins: many(wheelSpins),
      wagerRaceParticipations: many(wagerRaceParticipants)
    }));
    insertUserSchema = createInsertSchema(users);
    selectUserSchema = createSelectSchema(users);
    wheelSpins = pgTable("wheel_spins", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      segmentIndex: integer("segment_index").notNull(),
      rewardCode: text("reward_code"),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    bonusCodes = pgTable("bonus_codes", {
      id: serial("id").primaryKey(),
      code: text("code").notNull().unique(),
      userId: integer("user_id").references(() => users.id),
      claimedAt: timestamp("claimed_at").defaultNow().notNull(),
      expiresAt: timestamp("expires_at").notNull(),
      isUsed: boolean("is_used").default(false).notNull()
    });
    wagerRaces = pgTable("wager_races", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      type: text("type").notNull(),
      // 'weekly' | 'monthly' | 'weekend'
      status: text("status").notNull(),
      // 'upcoming' | 'live' | 'completed'
      prizePool: decimal("prize_pool", { precision: 18, scale: 2 }).notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      minWager: decimal("min_wager", { precision: 18, scale: 2 }).notNull(),
      prizeDistribution: jsonb("prize_distribution").notNull(),
      // { "1": 25, "2": 15, ... }
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
      rules: text("rules"),
      description: text("description")
    });
    wagerRaceParticipants = pgTable("wager_race_participants", {
      id: serial("id").primaryKey(),
      raceId: integer("race_id").references(() => wagerRaces.id),
      userId: integer("user_id").references(() => users.id),
      totalWager: decimal("total_wager", { precision: 18, scale: 2 }).notNull(),
      rank: integer("rank"),
      joinedAt: timestamp("joined_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull(),
      wagerHistory: jsonb("wager_history")
      // Track wager progress over time
    });
    supportTickets = pgTable("support_tickets", {
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
    ticketMessages = pgTable("ticket_messages", {
      id: serial("id").primaryKey(),
      ticketId: integer("ticket_id").references(() => supportTickets.id),
      userId: integer("user_id").references(() => users.id),
      message: text("message").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      isStaffReply: boolean("is_staff_reply").default(false).notNull()
    });
    wheelSpinRelations = relations(wheelSpins, ({ one }) => ({
      user: one(users, {
        fields: [wheelSpins.userId],
        references: [users.id]
      })
    }));
    bonusCodeRelations = relations(bonusCodes, ({ one }) => ({
      user: one(users, {
        fields: [bonusCodes.userId],
        references: [users.id]
      })
    }));
    wagerRaceRelations = relations(wagerRaces, ({ many }) => ({
      participants: many(wagerRaceParticipants)
    }));
    wagerRaceParticipantRelations = relations(
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
    supportTicketRelations = relations(supportTickets, ({ one, many }) => ({
      user: one(users, {
        fields: [supportTickets.userId],
        references: [users.id]
      }),
      messages: many(ticketMessages)
    }));
    ticketMessageRelations = relations(ticketMessages, ({ one }) => ({
      ticket: one(supportTickets, {
        fields: [ticketMessages.ticketId],
        references: [supportTickets.id]
      }),
      user: one(users, {
        fields: [ticketMessages.userId],
        references: [users.id]
      })
    }));
    insertWheelSpinSchema = createInsertSchema(wheelSpins);
    selectWheelSpinSchema = createSelectSchema(wheelSpins);
    insertBonusCodeSchema = createInsertSchema(bonusCodes);
    selectBonusCodeSchema = createSelectSchema(bonusCodes);
    insertWagerRaceSchema = createInsertSchema(wagerRaces);
    selectWagerRaceSchema = createSelectSchema(wagerRaces);
    insertWagerRaceParticipantSchema = createInsertSchema(
      wagerRaceParticipants
    );
    selectWagerRaceParticipantSchema = createSelectSchema(
      wagerRaceParticipants
    );
    insertSupportTicketSchema = createInsertSchema(supportTickets);
    selectSupportTicketSchema = createSelectSchema(supportTickets);
    insertTicketMessageSchema = createInsertSchema(ticketMessages);
    selectTicketMessageSchema = createSelectSchema(ticketMessages);
    historicalRaces = pgTable("historical_races", {
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
    newsletterSubscriptions = pgTable("newsletter_subscriptions", {
      id: serial("id").primaryKey(),
      email: text("email").unique().notNull(),
      isSubscribed: boolean("is_subscribed").default(true).notNull(),
      subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
      unsubscribedAt: timestamp("unsubscribed_at"),
      source: text("source")
    });
    notificationPreferences = pgTable("notification_preferences", {
      id: serial("id").primaryKey(),
      wagerRaceUpdates: boolean("wager_race_updates").default(true).notNull(),
      vipStatusChanges: boolean("vip_status_changes").default(true).notNull(),
      promotionalOffers: boolean("promotional_offers").default(true).notNull(),
      monthlyStatements: boolean("monthly_statements").default(true).notNull(),
      emailNotifications: boolean("email_notifications").default(true).notNull(),
      pushNotifications: boolean("push_notifications").default(true).notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    affiliateStats = pgTable("affiliate_stats", {
      id: serial("id").primaryKey(),
      totalWager: decimal("total_wager", { precision: 18, scale: 8 }).notNull(),
      commission: decimal("commission", { precision: 18, scale: 8 }).notNull(),
      timestamp: timestamp("timestamp").defaultNow().notNull()
    });
    mockWagerData = pgTable("mock_wager_data", {
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
    mockWagerDataRelations = relations(mockWagerData, ({ one }) => ({
      user: one(users, {
        fields: [mockWagerData.userId],
        references: [users.id]
      }),
      creator: one(users, {
        fields: [mockWagerData.createdBy],
        references: [users.id]
      })
    }));
    transformationLogs = pgTable("transformation_logs", {
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
    apiSyncMetadata = pgTable("api_sync_metadata", {
      id: serial("id").primaryKey(),
      endpoint: text("endpoint").notNull(),
      last_sync_time: timestamp("last_sync_time").defaultNow().notNull(),
      record_count: integer("record_count").default(0).notNull(),
      etag: text("etag"),
      last_modified: text("last_modified"),
      response_hash: text("response_hash"),
      is_full_sync: boolean("is_full_sync").default(true).notNull(),
      sync_duration_ms: integer("sync_duration_ms"),
      metadata: jsonb("metadata").default({}).notNull()
    });
    insertNewsletterSubscriptionSchema = createInsertSchema(
      newsletterSubscriptions
    );
    selectNewsletterSubscriptionSchema = createSelectSchema(
      newsletterSubscriptions
    );
    insertHistoricalRaceSchema = createInsertSchema(historicalRaces);
    selectHistoricalRaceSchema = createSelectSchema(historicalRaces);
    insertAffiliateStatsSchema = createInsertSchema(affiliateStats);
    selectAffiliateStatsSchema = createSelectSchema(affiliateStats);
    insertMockWagerDataSchema = createInsertSchema(mockWagerData);
    selectMockWagerDataSchema = createSelectSchema(mockWagerData);
    insertTransformationLogSchema = createInsertSchema(transformationLogs);
    selectTransformationLogSchema = createSelectSchema(transformationLogs);
    insertApiSyncMetadataSchema = createInsertSchema(apiSyncMetadata);
    selectApiSyncMetadataSchema = createSelectSchema(apiSyncMetadata);
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename, __dirname, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    __filename = fileURLToPath(import.meta.url);
    __dirname = dirname(__filename);
    vite_config_default = defineConfig({
      // Detect Replit deployment environment
      base: process.env.REPL_SLUG && process.env.NODE_ENV === "production" ? "/" : "/",
      plugins: [react(), runtimeErrorOverlay(), themePlugin()],
      resolve: {
        alias: {
          "@db": path.resolve(__dirname, "db"),
          "@": path.resolve(__dirname, "client", "src")
        }
      },
      root: path.resolve(__dirname, "client"),
      server: {
        port: 5173,
        strictPort: true,
        // Fail if port is already in use
        host: "0.0.0.0",
        // Expose to network for Replit compatibility
        hmr: {
          clientPort: 443,
          // For Replit's HTTPS forwarding
          host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : void 0,
          protocol: "wss"
          // Use secure WebSockets for Replit
        },
        watch: {
          usePolling: true,
          // Better for containerized environments like Replit
          interval: 1e3
        },
        // Allow all Replit hosts automatically
        allowedHosts: ["localhost", "0.0.0.0", ".replit.dev", ".replit.app", ".repl.co", ".spock.replit.dev"]
      },
      build: {
        outDir: path.resolve(__dirname, "dist/public"),
        emptyOutDir: true,
        minify: "terser",
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === "production",
            drop_debugger: process.env.NODE_ENV === "production"
          }
        },
        sourcemap: process.env.NODE_ENV !== "production",
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, "client/index.html"),
            admin: path.resolve(__dirname, "client/admin.html")
          },
          output: {
            manualChunks: {
              "vendor": ["react", "react-dom", "wouter"],
              "ui": [
                "@/components/ui",
                "framer-motion",
                "vaul",
                "tailwind-merge"
              ]
            }
          }
        }
      }
    });
  }
});

// server/vite.ts
import express from "express";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var __filename2, __dirname2, viteLogger, PATHS;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    init_vite_config();
    __filename2 = fileURLToPath2(import.meta.url);
    __dirname2 = dirname2(__filename2);
    viteLogger = createLogger();
    PATHS = {
      INDEX_HTML: path2.resolve(__dirname2, "..", "client", "index.html"),
      ADMIN_HTML: path2.resolve(__dirname2, "..", "admin", "index.html")
      //Example path, adjust as needed.
    };
  }
});

// db/index.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
var sql2, db;
var init_db = __esm({
  "db/index.ts"() {
    "use strict";
    init_schema();
    init_vite();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    sql2 = neon(process.env.DATABASE_URL);
    db = drizzle(sql2, { schema: schema_exports });
    sql2`SELECT 1`.then(() => {
      log2("Database connection established successfully");
    }).catch((error) => {
      log2(`Database connection error: ${error.message}`);
    });
  }
});

// server/utils/user-activity.ts
var user_activity_exports = {};
__export(user_activity_exports, {
  getMostActiveUsers: () => getMostActiveUsers,
  getUserActivityStats: () => getUserActivityStats,
  updateUserActivityStatus: () => updateUserActivityStatus
});
import { gt as gt2, sql as sql9 } from "drizzle-orm";
async function updateUserActivityStatus() {
  try {
    const { active, inactive } = await getUserActivityStats();
    return {
      updated: 0,
      // No updates performed as we're just using the total_wager directly
      active,
      inactive
    };
  } catch (error) {
    console.error("Error updating user activity status:", error);
    throw error;
  }
}
async function getUserActivityStats() {
  try {
    const result = await db.execute(
      sql9`SELECT 
        SUM(CASE WHEN total_wager > 0 THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN total_wager = 0 THEN 1 ELSE 0 END) as inactive_count,
        COUNT(*) as total_count
      FROM users`
    );
    const row = result.rows[0];
    return {
      active: Number(row.active_count || 0),
      inactive: Number(row.inactive_count || 0),
      total: Number(row.total_count || 0)
    };
  } catch (error) {
    console.error("Error fetching user activity stats:", error);
    throw error;
  }
}
async function getMostActiveUsers(limit = 100) {
  try {
    return await db.select({
      id: users.id,
      username: users.username,
      goatedId: users.goatedId,
      total_wager: users.total_wager
    }).from(users).where(gt2(users.total_wager, 0)).orderBy(sql9`users.total_wager DESC`).limit(limit);
  } catch (error) {
    console.error("Error fetching most active users:", error);
    throw error;
  }
}
var init_user_activity = __esm({
  "server/utils/user-activity.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/index.ts
import express2 from "express";
import cookieParser2 from "cookie-parser";
import { createServer as createServer2 } from "http";

// server/config/websocket.ts
import { WebSocketServer, WebSocket } from "ws";

// server/utils/logger.ts
function log(message, source = "express", level = "info") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  switch (level) {
    case "debug":
      console.debug(`${formattedTime} [${source}] ${message}`);
      break;
    case "info":
      console.log(`${formattedTime} [${source}] ${message}`);
      break;
    case "warn":
      console.warn(`${formattedTime} [${source}] ${message}`);
      break;
    case "error":
      console.error(`${formattedTime} [${source}] ${message}`);
      break;
    default:
      console.log(`${formattedTime} [${source}] ${message}`);
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
import { promisify as promisify2 } from "util";
import { exec } from "child_process";
import { sql as sql11, gt as gt3, desc as desc4 } from "drizzle-orm";

// server/routes.ts
init_db();
init_vite();
import { Router as Router8 } from "express";
import compression from "compression";
import { sql as sql10 } from "drizzle-orm";
import { createServer } from "http";
import { WebSocket as WebSocket2 } from "ws";

// server/config/api.ts
var API_CONFIG = {
  baseUrl: "https://api.goated.com/user2",
  token: process.env.API_TOKEN || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJNZ2xjTU9DNEl6cWpVbzVhTXFBVyIsInNlc3Npb24iOiJwaVJKVGs4NHp4SVIiLCJpYXQiOjE3NDMyOTY4NDksImV4cCI6MTc0MzM4MzI0OX0.KiIq4FHDL0ZIrbRTdJQMO3as0dRFjalpJLiPbC2ka0U",
  endpoints: {
    leaderboard: "/affiliate/referral-leaderboard/2RW440E",
    health: "/health"
    // Removed invalid player endpoint
  },
  fallbackData: {
    // Fallback data structure when API is unavailable
    leaderboard: {
      status: "success",
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
    }
  }
};

// server/routes.ts
import { RateLimiterMemory as RateLimiterMemory3 } from "rate-limiter-flexible";

// server/routes/bonus-challenges.ts
init_db();
import { Router } from "express";

// db/schema/bonus.ts
import { pgTable as pgTable3, text as text3, timestamp as timestamp3, integer as integer3, boolean as boolean3 } from "drizzle-orm/pg-core";
import { sql as sql4 } from "drizzle-orm";

// db/schema/users.ts
import { pgTable as pgTable2, text as text2, timestamp as timestamp2, integer as integer2, boolean as boolean2, jsonb as jsonb2 } from "drizzle-orm/pg-core";
import { sql as sql3 } from "drizzle-orm";
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
  goatedAccountLinked: boolean2("goated_account_linked").default(false),
  goatedUsername: text2("goated_username"),
  goatedId: text2("goated_id").unique(),
  // Add goatedId field to link to Goated user ID
  createdAt: timestamp2("created_at").default(sql3`CURRENT_TIMESTAMP`),
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
});
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
  createdAt: timestamp3("created_at").default(sql4`CURRENT_TIMESTAMP`),
  updatedAt: timestamp3("updated_at").default(sql4`CURRENT_TIMESTAMP`),
  expiresAt: timestamp3("expires_at"),
  status: text3("status").default("active"),
  source: text3("source").default("web"),
  createdBy: integer3("created_by").references(() => users2.id)
});
var bonusCodeClaims = pgTable3("bonus_code_claims", {
  id: integer3("id").primaryKey(),
  userId: integer3("user_id").notNull().references(() => users2.id),
  bonusCodeId: integer3("bonus_code_id").notNull().references(() => bonusCodes2.id),
  claimedAt: timestamp3("claimed_at").default(sql4`CURRENT_TIMESTAMP`),
  wagerCompleted: boolean3("wager_completed").default(false),
  completedAt: timestamp3("completed_at")
});

// server/routes/bonus-challenges.ts
init_vite();
import { eq, and, gt } from "drizzle-orm";
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
        eq(bonusCodes2.status, "active"),
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
    const [updated] = await db.update(bonusCodes2).set(updateData).where(eq(bonusCodes2.id, parseInt(id))).returning();
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
    }).where(eq(bonusCodes2.id, parseInt(id))).returning();
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
init_db();
init_schema();
import { Router as Router2 } from "express";
import { like, eq as eq2, sql as sql5 } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import bcrypt from "bcrypt";
var upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB limit
});
var router2 = Router2();
var loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
router2.get("/search", async (req, res) => {
  const q = req.query.q;
  let username = req.query.username;
  const goatedId = req.query.goatedId;
  if (q && !username) {
    username = q;
  }
  const isAdminView = req.headers["x-admin-view"] === "true";
  if (!username && !goatedId) {
    return res.status(400).json({ error: "Either username, q, or goatedId must be provided" });
  }
  if (username && (typeof username !== "string" || username.length < 2)) {
    return res.status(400).json({ error: "Username must be at least 2 characters" });
  }
  try {
    let results;
    if (goatedId) {
      results = await db.select().from(users).where(eq2(users.goatedId, goatedId)).limit(10);
    } else {
      results = await db.select().from(users).where(like(users.username, `%${username}%`)).limit(10);
    }
    const mappedResults = results.map((user) => {
      const extUser = user;
      return {
        id: extUser.id,
        username: extUser.username,
        email: extUser.email,
        isAdmin: extUser.isAdmin,
        createdAt: extUser.createdAt,
        emailVerified: extUser.emailVerified,
        // Add profile fields
        bio: extUser.bio || "",
        profileColor: extUser.profileColor || "#D7FF00",
        goatedId: extUser.goatedId || null,
        goatedUsername: extUser.goatedUsername || null,
        // Only include sensitive data for admin view
        ...isAdminView && {
          // Telegram related fields
          telegramId: extUser.telegramId,
          // Location and activity fields
          lastLoginIp: extUser.lastLoginIp,
          registrationIp: extUser.registrationIp,
          country: extUser.country,
          city: extUser.city,
          lastActive: extUser.lastActive,
          // Analytics fields
          ipHistory: extUser.ipHistory || [],
          loginHistory: extUser.loginHistory || [],
          // Security fields
          twoFactorEnabled: extUser.twoFactorEnabled,
          suspiciousActivity: extUser.suspiciousActivity,
          activityLogs: extUser.activityLogs || []
        }
      };
    });
    res.json(mappedResults);
  } catch (error) {
    console.error("Error in user search:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});
router2.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authenticateUser(username, password);
    if (user) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router2.post("/api/profile/image", upload.single("image"), async (req, res) => {
  try {
    const imageUrl = await saveProfileImage(req.file);
    res.json({ imageUrl });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router2.put("/api/profile/preferences", async (req, res) => {
  try {
    const { preferences } = req.body;
    await updateUserPreferences(req.user?.id || 0, preferences);
    res.json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Preference update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`User profile requested for ID: ${id}`);
    const isNumericId = /^\d+$/.test(id);
    console.log(`Is numeric ID: ${isNumericId}`);
    let user;
    try {
      console.log(`Executing SQL query for ID ${id}`);
      const results = await db.execute(sql5`
        SELECT 
          id, 
          username, 
          bio, 
          profile_color as "profileColor", 
          created_at as "createdAt", 
          goated_id as "goatedId"
        FROM users 
        WHERE id::text = ${id}
        LIMIT 1
      `);
      console.log(`Query results:`, results);
      user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      console.log("Extracted user by ID:", user);
    } catch (findError) {
      console.log("Error finding user by ID:", findError);
      user = null;
    }
    if (!user && isNumericId) {
      try {
        console.log(`Checking if ${id} is a Goated ID`);
        const results = await db.execute(sql5`
          SELECT 
            id, 
            username, 
            bio, 
            profile_color as "profileColor", 
            created_at as "createdAt", 
            goated_id as "goatedId"
          FROM users 
          WHERE goated_id = ${id}
          LIMIT 1
        `);
        console.log(`Goated ID query results:`, results);
        user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
        console.log("Extracted user by Goated ID:", user);
      } catch (goatedIdError) {
        console.log("Error finding user by Goated ID:", goatedIdError);
        user = null;
      }
      if (!user) {
        try {
          console.log(`Attempting to find user in leaderboard API for ID ${id}`);
          const API_TOKEN3 = process.env.API_TOKEN || API_CONFIG.token;
          if (API_TOKEN3) {
            const response = await fetch(
              `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
              {
                headers: {
                  Authorization: `Bearer ${API_TOKEN3}`,
                  "Content-Type": "application/json"
                }
              }
            );
            if (response.ok) {
              const leaderboardData = await response.json();
              const timeframes = ["today", "weekly", "monthly", "all_time"];
              let foundUser = null;
              for (const timeframe of timeframes) {
                const users3 = leaderboardData?.data?.[timeframe]?.data || [];
                foundUser = users3.find((u) => u.uid === id);
                if (foundUser) {
                  console.log(`Found user ${id} in ${timeframe} leaderboard data:`, foundUser);
                  break;
                }
              }
              if (foundUser && foundUser.name) {
                console.log(`Found player in leaderboard API:`, foundUser);
                const userId = Math.floor(1e3 + Math.random() * 9e3);
                const email = `${foundUser.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@goated.placeholder.com`;
                console.log(`Creating new user with ID ${userId} for Goated player ${foundUser.name}`);
                await db.execute(sql5`
                  INSERT INTO users (
                    id, username, email, password, created_at, updated_at, profile_color, bio, is_admin, goated_id, goated_username, goated_account_linked
                  ) VALUES (
                    ${userId}, ${foundUser.name}, ${email}, '', ${/* @__PURE__ */ new Date()}, ${/* @__PURE__ */ new Date()}, '#D7FF00', 'Official Goated.com player profile', false, ${id}, ${foundUser.name}, true
                  )
                `);
                user = {
                  id: userId,
                  username: foundUser.name,
                  bio: "Official Goated.com player profile",
                  profileColor: "#D7FF00",
                  createdAt: /* @__PURE__ */ new Date(),
                  goatedId: id
                };
                console.log(`Created and returning new user:`, user);
              } else {
                console.log(`User ID ${id} not found in any leaderboard timeframe`);
              }
            } else {
              console.log(`API returned non-OK response:`, response.status);
            }
          } else {
            console.log(`No API_TOKEN available for external API request`);
          }
        } catch (apiError) {
          console.error("Error creating user from API:", apiError);
        }
      }
    }
    if (!user) {
      console.log(`No user found for ID ${id}`);
      return res.status(404).json({
        error: "User not found"
      });
    }
    console.log(`Returning user:`, user);
    res.json(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});
router2.put("/:id/profile", async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, profileColor } = req.body;
    console.log(`Profile update requested for ID: ${id}`);
    console.log(`Bio: ${bio}, ProfileColor: ${profileColor}`);
    try {
      const results = await db.execute(sql5`
        SELECT id FROM users WHERE id::text = ${id} LIMIT 1
      `);
      console.log(`Profile update check results:`, results);
      const existingUser = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      await db.execute(sql5`
        UPDATE users 
        SET bio = ${bio}, profile_color = ${profileColor}
        WHERE id::text = ${id}
      `);
      console.log(`Profile updated successfully for user ${id}`);
      res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error finding or updating user:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});
router2.post("/ensure-profile", async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(400).json({
        error: "Username and email are required"
      });
    }
    const existingUser = await db.query.users.findFirst({
      where: eq2(users.username, username),
      columns: { id: true }
    });
    if (existingUser) {
      return res.json({
        success: true,
        message: "User profile already exists",
        id: existingUser.id
      });
    }
    const userId = uuidv4();
    await db.execute(sql5`
      INSERT INTO users (
        id, username, email, password, created_at, profile_color, bio, is_admin
      ) VALUES (
        ${userId}, ${username}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', '', false
      )
    `);
    res.json({
      success: true,
      message: "User profile created successfully",
      id: userId
    });
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    res.status(500).json({ error: "Failed to create user profile" });
  }
});
async function authenticateUser(username, password) {
  return null;
}
function generateToken(user) {
  return null;
}
async function saveProfileImage(file) {
  return null;
}
async function updateUserPreferences(userId, preferences) {
  return;
}
router2.post("/create-test-users", async (req, res) => {
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
        const existingUser = await db.select().from(users).where(sql5`username = ${user.username}`).limit(1);
        if (existingUser && existingUser.length > 0) {
          existingCount++;
          continue;
        }
        const hashedPassword = await bcrypt.hash("password123", 10);
        const randomId = Math.floor(1e3 + Math.random() * 9e3);
        await db.execute(sql5`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, bio, is_admin, email_verified
          ) VALUES (
            ${randomId}, ${user.username}, ${user.email}, ${hashedPassword}, ${/* @__PURE__ */ new Date()},
            ${user.profileColor}, 'This is a test user account created for development purposes.', false, true
          )
        `);
        createdCount++;
        console.log(`Created test user: ${user.username} with ID ${randomId}`);
      } catch (insertError) {
        console.error(`Error creating test user ${user.username}:`, insertError);
        errors.push(`Failed to create ${user.username}: ${insertError.message}`);
      }
    }
    res.json({
      success: true,
      message: `Created ${createdCount} test users, ${existingCount} already existed`,
      errors: errors.length > 0 ? errors : void 0
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({ error: "Failed to create test users" });
  }
});
router2.post("/sync-profiles-from-leaderboard", async (req, res) => {
  try {
    const API_TOKEN3 = process.env.API_TOKEN;
    if (!API_TOKEN3) {
      return res.status(500).json({
        error: "API_TOKEN is not configured"
      });
    }
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN3}`,
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch leaderboard data",
        status: response.status
      });
    }
    const leaderboardData = await response.json();
    const allTimeData = leaderboardData?.data?.all_time?.data || [];
    let createdCount = 0;
    let existingCount = 0;
    const errors = [];
    for (const player of allTimeData) {
      try {
        if (!player.uid || !player.name) continue;
        const existingUser = await db.select().from(users).where(sql5`goated_id = ${player.uid}`).limit(1);
        if (existingUser && existingUser.length > 0) {
          existingCount++;
          continue;
        }
        const userId = uuidv4();
        const email = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@goated.placeholder.com`;
        await db.execute(sql5`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, bio, is_admin, goated_id, goated_username, goated_account_linked
          ) VALUES (
            ${userId}, ${player.name}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 'Official Goated.com player profile', false, ${player.uid}, ${player.name}, true
          )
        `);
        createdCount++;
      } catch (error) {
        console.error(`Error processing user ${player?.name}:`, error);
        errors.push(`Error creating profile for ${player?.name}: ${error.message}`);
      }
    }
    res.json({
      success: true,
      message: `Profile sync completed. Created ${createdCount} new profiles, ${existingCount} already existed.`,
      errors: errors.length > 0 ? errors : void 0
    });
  } catch (error) {
    console.error("Error syncing profiles from leaderboard:", error);
    res.status(500).json({ error: "Failed to sync profiles from leaderboard" });
  }
});
router2.get("/by-goated-id/:goatedId", async (req, res) => {
  try {
    const { goatedId } = req.params;
    if (!goatedId) {
      return res.status(400).json({ error: "Goated ID is required" });
    }
    try {
      const results = await db.execute(sql5`
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
        WHERE goated_id = ${goatedId}
        LIMIT 1
      `);
      const user = results.rows && results.rows.length > 0 ? results.rows[0] : null;
      if (user) {
        console.log(`Found existing profile for Goated ID ${goatedId}`);
        return res.json({
          ...user,
          isLinked: user.goatedAccountLinked
        });
      }
      console.log(`No profile found for Goated ID ${goatedId}, creating one...`);
      const newUser = await ensureUserProfile(goatedId);
      if (!newUser) {
        return res.status(404).json({
          error: "User not found and could not be created"
        });
      }
      let profileType = "standard";
      if (newUser.isPermanent) profileType = "permanent";
      else if (newUser.isTemporary) profileType = "temporary";
      else if (newUser.isCustom) profileType = "custom";
      return res.json({
        ...newUser,
        profileType,
        isLinked: newUser.goatedAccountLinked || false,
        isNewlyCreated: true
      });
    } catch (sqlError) {
      console.error("Error processing Goated ID request:", sqlError);
      return res.status(500).json({ error: "Database error when fetching user" });
    }
  } catch (error) {
    console.error("Error getting user by Goated ID:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
});
router2.get("/test-create-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "User ID is required in URL path"
      });
    }
    console.log(`[TEST] Ensuring profile exists for ID: ${userId}`);
    const user = await ensureUserProfile(userId);
    if (!user) {
      console.error(`Failed to create profile for ID ${userId}`);
      return res.status(500).json({
        error: "Failed to create user profile"
      });
    }
    let message = "User profile already exists";
    if (user.isNewlyCreated) {
      if (user.isPermanent) {
        message = "Permanent Goated profile created successfully";
      } else {
        message = "Temporary placeholder profile created";
      }
    }
    return res.json({
      success: true,
      message,
      user
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    return res.status(500).json({
      error: "Failed to process request",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.post("/ensure-profile-from-id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        error: "User ID is required"
      });
    }
    console.log(`Ensuring profile exists for ID: ${userId}`);
    const user = await ensureUserProfile(userId);
    if (!user) {
      console.error(`Failed to create profile for ID ${userId}`);
      return res.status(500).json({
        error: "Failed to create user profile"
      });
    }
    let message = "User profile already exists";
    if (user.isNewlyCreated) {
      if (user.isPermanent) {
        message = "Permanent Goated profile created successfully";
      } else if (user.isTemporary) {
        message = "Temporary profile created - will be linked to Goated account when verified";
      } else if (user.isCustom) {
        message = "Custom profile created successfully";
      } else {
        message = "User profile created successfully";
      }
    }
    return res.json({
      success: true,
      message,
      id: user.id,
      username: user.username,
      goatedId: user.goatedId,
      goatedUsername: user.goatedUsername,
      isLinked: user.goatedAccountLinked || false,
      profileType: user.isPermanent ? "permanent" : user.isTemporary ? "temporary" : user.isCustom ? "custom" : "standard"
    });
  } catch (error) {
    console.error("Error ensuring user profile from ID:", error);
    res.status(500).json({ error: "Failed to process user profile request" });
  }
});
router2.get("/test-profile-creation/:type/:userId", async (req, res) => {
  try {
    const { userId, type } = req.params;
    if (!userId) {
      return res.status(400).json({
        error: "User ID is required in URL path"
      });
    }
    console.log(`[ENHANCED TEST] Testing profile creation for ID: ${userId}, Type: ${type}`);
    let user;
    switch (type) {
      case "api-success":
        user = await ensureUserProfile(userId);
        break;
      case "api-error":
        const originalBaseUrl = API_CONFIG.baseUrl;
        API_CONFIG.baseUrl = "https://invalid-api-url.com";
        user = await ensureUserProfile(userId);
        API_CONFIG.baseUrl = originalBaseUrl;
        break;
      case "non-numeric":
        user = await ensureUserProfile(`test-${userId}`);
        break;
      default:
        user = await ensureUserProfile(userId);
    }
    if (!user) {
      console.error(`Failed to create profile for ID ${userId} with test type ${type}`);
      return res.status(500).json({
        error: "Failed to create user profile",
        testType: type
      });
    }
    return res.json({
      success: true,
      testType: type,
      user: {
        id: user.id,
        username: user.username,
        goatedId: user.goatedId,
        goatedUsername: user.goatedUsername,
        isNewlyCreated: user.isNewlyCreated,
        isPermanent: user.isPermanent,
        isTemporary: user.isTemporary,
        isCustom: user.isCustom,
        goatedAccountLinked: user.goatedAccountLinked,
        profileType: user.isPermanent ? "permanent" : user.isTemporary ? "temporary" : user.isCustom ? "custom" : "standard"
      }
    });
  } catch (error) {
    console.error(`Error in enhanced profile test (type: ${req.params.type}):`, error);
    return res.status(500).json({
      error: "Failed to process enhanced test request",
      testType: req.params.type,
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
var users_default = router2;

// server/routes/user-stats.ts
init_db();
import { Router as Router3 } from "express";
import { sql as sql6 } from "drizzle-orm";
var router3 = Router3();
router3.post("/ensure-profile-from-id", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    const userProfile = await ensureUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found and could not be created"
      });
    }
    return res.json({
      success: true,
      id: userProfile.id,
      message: "User profile verified"
    });
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify user profile"
    });
  }
});
router3.get("/stats/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`User stats requested for ID: ${userId}`);
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "User ID is required"
      });
    }
    const userProfile = await ensureUserProfile(userId);
    if (!userProfile) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    let query;
    const isNumericId = !isNaN(Number(userId));
    if (isNumericId) {
      console.log(`Executing SQL query for ID ${userId}`);
      query = sql6`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.goated_id AS "goatedId",
          u.bio,
          u.profile_color AS "profileColor",
          u.created_at AS "createdAt",
          u.total_wager AS "totalWagered",
          u.wager_week AS "weeklyWagered",
          u.wager_month AS "monthlyWagered",
          u.goated_account_linked AS "goatedAccountLinked",
          u.uid AS "telegramUsername"
        FROM users u
        WHERE u.id = ${parseInt(userId)}
        LIMIT 1
      `;
    } else {
      console.log(`Executing SQL query for Goated ID ${userId}`);
      query = sql6`
        SELECT 
          u.id,
          u.username,
          u.email,
          u.goated_id AS "goatedId",
          u.bio,
          u.profile_color AS "profileColor",
          u.created_at AS "createdAt",
          u.total_wager AS "totalWagered",
          u.wager_week AS "weeklyWagered",
          u.wager_month AS "monthlyWagered",
          u.goated_account_linked AS "goatedAccountLinked",
          u.uid AS "telegramUsername"
        FROM users u
        WHERE u.goated_id = ${userId}
        LIMIT 1
      `;
    }
    const result = await db.execute(query);
    console.log("Query results:", JSON.stringify(result, null, 2));
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found after query"
      });
    }
    const userData = result.rows[0];
    console.log("Extracted user data:", userData);
    let tier = "copper";
    const totalWagered = parseFloat(userData.totalWagered || "0");
    if (totalWagered >= 15e5) {
      tier = "pearl";
    } else if (totalWagered >= 45e4) {
      tier = "platinum";
    } else if (totalWagered >= 25e4) {
      tier = "diamond";
    } else if (totalWagered >= 1e5) {
      tier = "gold";
    } else if (totalWagered >= 1e4) {
      tier = "silver";
    } else if (totalWagered >= 1e3) {
      tier = "bronze";
    }
    res.json({
      ...userData,
      tier
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user statistics"
    });
  }
});
var user_stats_default = router3;

// server/routes/verification.ts
init_db();
init_schema();
import { Router as Router4 } from "express";

// db/schema/verification.ts
init_schema();
import { pgTable as pgTable4, serial as serial2, text as text4, integer as integer4, timestamp as timestamp4, boolean as boolean4 } from "drizzle-orm/pg-core";
import { relations as relations3 } from "drizzle-orm";
import { createInsertSchema as createInsertSchema2, createSelectSchema as createSelectSchema2 } from "drizzle-zod";
var verificationRequests = pgTable4("verification_requests", {
  id: serial2("id").primaryKey(),
  userId: integer4("user_id").notNull().references(() => users.id),
  telegramId: text4("telegram_id").notNull(),
  telegramUsername: text4("telegram_username").notNull(),
  goatedUsername: text4("goated_username").notNull(),
  status: text4("status").notNull().default("pending"),
  verifiedBy: text4("verified_by"),
  verifiedAt: timestamp4("verified_at", { mode: "date" }),
  requestedAt: timestamp4("requested_at", { mode: "date" }).defaultNow(),
  adminNotes: text4("admin_notes")
});
var verificationRequestRelations = relations3(verificationRequests, ({ one }) => ({
  user: one(users, {
    fields: [verificationRequests.userId],
    references: [users.id]
  })
}));
var insertVerificationRequestSchema = createInsertSchema2(verificationRequests);
var selectVerificationRequestSchema = createSelectSchema2(verificationRequests);
var emailVerificationFields = {
  // Verification token for email confirmation
  emailVerificationToken: text4("email_verification_token"),
  // When the verification token expires
  emailVerificationExpires: timestamp4("email_verification_expires", { mode: "date" }),
  // If the email has been verified (using the same field name as in users schema)
  emailVerified: boolean4("email_verified").default(false),
  // Password reset token
  passwordResetToken: text4("password_reset_token"),
  // When the password reset token expires
  passwordResetExpires: timestamp4("password_reset_expires", { mode: "date" }),
  // Token version for invalidating JWT tokens
  tokenVersion: integer4("token_version").default(0)
};

// server/routes/verification.ts
import { eq as eq4, desc as desc2, sql as sql7, and as and2 } from "drizzle-orm";
import rateLimit2 from "express-rate-limit";
import { z as z2 } from "zod";
var router4 = Router4();
var verificationLimiter = rateLimit2({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 5,
  // Limit each IP to 5 verification requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification requests from this IP, please try again later." }
});
router4.post("/request", verificationLimiter, async (req, res) => {
  try {
    const requestSchema = z2.object({
      userId: z2.number().optional(),
      goatedId: z2.string(),
      goatedUsername: z2.string(),
      telegramId: z2.string(),
      telegramUsername: z2.string(),
      proofImageUrl: z2.string().optional(),
      notes: z2.string().optional()
    });
    const result = requestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
        errors: result.error.issues
      });
    }
    const { goatedId, goatedUsername, telegramId, telegramUsername, notes } = result.data;
    let { userId } = result.data;
    const existingUser = await db.select().from(users).where(eq4(users.goatedId, goatedId)).limit(1);
    if (!existingUser || existingUser.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User with this Goated ID not found in our system"
      });
    }
    userId = existingUser[0].id;
    const existingRequest = await db.select().from(verificationRequests).where(
      and2(
        eq4(verificationRequests.userId, userId),
        eq4(verificationRequests.status, "pending")
      )
    ).limit(1);
    if (existingRequest && existingRequest.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "You already have a pending verification request"
      });
    }
    const newVerificationRequest = {
      id: Math.floor(1e3 + Math.random() * 9e3),
      // Generate random ID for the request
      userId,
      telegramId,
      telegramUsername,
      goatedUsername,
      status: "pending",
      adminNotes: notes || null
    };
    const insertResult = await db.execute(sql7`
      INSERT INTO verification_requests (
        id, user_id, telegram_id, telegram_username, 
        goated_username, status, admin_notes
      ) VALUES (
        ${newVerificationRequest.id}, 
        ${newVerificationRequest.userId}, 
        ${newVerificationRequest.telegramId}, 
        ${newVerificationRequest.telegramUsername}, 
        ${newVerificationRequest.goatedUsername}, 
        ${newVerificationRequest.status}, 
        ${newVerificationRequest.adminNotes}
      ) RETURNING *
    `);
    res.status(201).json({
      status: "success",
      message: "Verification request submitted successfully",
      data: insertResult.rows && insertResult.rows.length > 0 ? insertResult.rows[0] : { id: newVerificationRequest.id }
    });
  } catch (error) {
    console.error("Error creating verification request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to submit verification request"
    });
  }
});
router4.get("/status/:goatedId", async (req, res) => {
  try {
    const { goatedId } = req.params;
    const user = await db.select().from(users).where(eq4(users.goatedId, goatedId)).limit(1);
    if (!user || user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }
    const userId = user[0].id;
    if (user[0].goatedAccountLinked) {
      return res.json({
        status: "success",
        verified: true,
        message: "User is already verified"
      });
    }
    const request = await db.select().from(verificationRequests).where(eq4(verificationRequests.userId, userId)).orderBy(desc2(verificationRequests.requestedAt)).limit(1);
    if (!request || request.length === 0) {
      return res.json({
        status: "success",
        verified: false,
        requestExists: false,
        message: "No verification request found"
      });
    }
    res.json({
      status: "success",
      verified: request[0].status === "approved",
      requestStatus: request[0].status,
      requestExists: true,
      requestedAt: request[0].requestedAt,
      message: request[0].status === "approved" ? "Verification approved" : request[0].status === "rejected" ? "Verification rejected" : "Verification pending"
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check verification status"
    });
  }
});
router4.get("/admin/requests", async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    const status = req.query.status || "pending";
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const offset = (page - 1) * limit;
    const requests = await db.execute(sql7`
      SELECT 
        vr.id, 
        vr.user_id, 
        vr.telegram_id, 
        vr.telegram_username, 
        vr.goated_username, 
        vr.status, 
        vr.verified_by, 
        vr.verified_at, 
        vr.requested_at, 
        vr.admin_notes,
        u.username,
        u.goated_id,
        u.email
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.status = ${status}
      ORDER BY vr.requested_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);
    const countResult = await db.execute(sql7`
      SELECT COUNT(*) as count FROM verification_requests WHERE status = ${status}
    `);
    const total = countResult.rows && countResult.rows.length > 0 ? parseInt(countResult.rows[0].count.toString()) || 0 : 0;
    res.json({
      status: "success",
      data: requests.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error listing verification requests:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to list verification requests"
    });
  }
});
router4.post("/admin/action/:requestId", async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized"
      });
    }
    const { requestId } = req.params;
    const { action, notes } = req.body;
    if (action !== "approve" && action !== "reject") {
      return res.status(400).json({
        status: "error",
        message: "Invalid action, must be 'approve' or 'reject'"
      });
    }
    const request = await db.select().from(verificationRequests).where(eq4(verificationRequests.id, parseInt(requestId))).limit(1);
    if (!request || request.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Verification request not found"
      });
    }
    const verificationRequest = request[0];
    await db.update(verificationRequests).set({
      status: action === "approve" ? "approved" : "rejected",
      verifiedBy: req.user.username,
      verifiedAt: /* @__PURE__ */ new Date(),
      adminNotes: notes || verificationRequest.adminNotes
    }).where(eq4(verificationRequests.id, parseInt(requestId)));
    if (action === "approve") {
      await db.execute(sql7`
        UPDATE users
        SET 
          goated_account_linked = true,
          telegram_id = ${verificationRequest.telegramId},
          telegram_username = ${verificationRequest.telegramUsername}
        WHERE id = ${verificationRequest.userId}
      `);
    }
    res.json({
      status: "success",
      message: `Verification request ${action === "approve" ? "approved" : "rejected"} successfully`
    });
  } catch (error) {
    console.error("Error processing verification action:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process verification action"
    });
  }
});
var verification_default = router4;

// server/routes/email-verification.ts
init_db();
init_schema();
import { Router as Router5 } from "express";
import crypto from "crypto";
import { eq as eq6 } from "drizzle-orm";

// server/services/emailService.ts
import nodemailer from "nodemailer";
var DEFAULT_CONFIG = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "ethereal.user@ethereal.email",
    pass: "ethereal_password"
  }
};
var EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  from: process.env.EMAIL_FROM || "GoatedVIPs <noreply@goatedvips.com>"
};
var APP_URL = process.env.APP_URL || "https://goatedvips.com";
function createTransporter() {
  if (EMAIL_CONFIG.host && EMAIL_CONFIG.auth.user) {
    return nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: {
        user: EMAIL_CONFIG.auth.user,
        pass: EMAIL_CONFIG.auth.pass
      }
    });
  }
  log("Using ethereal email for development", "email", "info");
  return nodemailer.createTransport(DEFAULT_CONFIG);
}
async function sendEmail(to, subject, html, text5) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      text: text5,
      html
    });
    log(`Email sent: ${info.messageId}`, "email", "info");
    if (!EMAIL_CONFIG.host && info.messageId) {
      log(`Email sent with message ID: ${info.messageId}`, "email", "info");
    }
    return info;
  } catch (error) {
    log("Error sending email: " + (error instanceof Error ? error.message : String(error)), "email", "error");
    throw error;
  }
}
async function sendVerificationEmail(to, username, token) {
  const verificationLink = `${APP_URL}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${APP_URL}/logo.svg" alt="GoatedVIPs Logo" style="max-width: 150px;" />
      </div>
      <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
      <p style="color: #666; line-height: 1.5;">Hello ${username},</p>
      <p style="color: #666; line-height: 1.5;">Thank you for signing up with GoatedVIPs! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" style="background-color: #FDE047; color: #1f2937; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email</a>
      </div>
      <p style="color: #666; line-height: 1.5;">Or copy and paste this link into your browser:</p>
      <p style="color: #666; line-height: 1.5; word-break: break-all;"><a href="${verificationLink}" style="color: #3182ce;">${verificationLink}</a></p>
      <p style="color: #666; line-height: 1.5;">This link will expire in 24 hours.</p>
      <p style="color: #666; line-height: 1.5;">If you did not sign up for a GoatedVIPs account, you can safely ignore this email.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; text-align: center; color: #999; font-size: 12px;">
        <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} GoatedVIPs. All rights reserved.</p>
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
  const text5 = `
    Hello ${username},
    
    Thank you for signing up with GoatedVIPs! Please verify your email address by visiting the link below:
    
    ${verificationLink}
    
    This link will expire in 24 hours.
    
    If you did not sign up for a GoatedVIPs account, you can safely ignore this email.
    
    \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} GoatedVIPs. All rights reserved.
    This is an automated message, please do not reply to this email.
  `;
  return sendEmail(to, "Verify Your Email Address - GoatedVIPs", html, text5);
}

// server/auth.ts
init_schema();
init_db();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { eq as eq5, and as and3 } from "drizzle-orm";
import { RateLimiterMemory as RateLimiterMemory2 } from "rate-limiter-flexible";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
var scryptAsync = promisify(scrypt);
var authLimiter = new RateLimiterMemory2({
  points: 20,
  // 20 attempts
  duration: 60 * 5,
  // per 5 minutes
  blockDuration: 60 * 2
  // Block for 2 minutes
});
var sensitiveOpLimiter = new RateLimiterMemory2({
  points: 5,
  // 5 attempts
  duration: 60 * 10,
  // per 10 minutes
  blockDuration: 60 * 15
  // Block for 15 minutes
});
var tokenRefreshLimiter = new RateLimiterMemory2({
  points: 30,
  // 30 attempts
  duration: 60 * 15,
  // per 15 minutes
  blockDuration: 60 * 5
  // Block for 5 minutes
});
var JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";
var JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${JWT_SECRET}-refresh`;
var ACCESS_TOKEN_EXPIRY = "15m";
var REFRESH_TOKEN_EXPIRY = "7d";
var LOCKOUT_DURATION = 30 * 60 * 1e3;
function setupAuth(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const [user] = await db.select().from(users).where(eq5(users.id, id)).limit(1);
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
            return done(null, {
              id: 1,
              username: process.env.ADMIN_USERNAME,
              isAdmin: true,
              email: `${process.env.ADMIN_USERNAME}@admin.local`
            });
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
        const [user] = await db.select().from(users).where(eq5(users.username, sanitizedUsername)).limit(1);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        const isMatch = await comparePasswords(sanitizedPassword, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" });
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
      const [existingUsername] = await db.select().from(users).where(eq5(users.username, sanitizedUsername)).limit(1);
      if (existingUsername) {
        return res.status(400).json({
          status: "error",
          message: "Username already exists"
        });
      }
      const hashedPassword = await hashPassword(password);
      const emailVerificationToken = randomBytes(32).toString("hex");
      const [newUser] = await db.insert(users).values({
        username: sanitizedUsername,
        password: hashedPassword,
        email: email.toLowerCase(),
        isAdmin: false,
        emailVerificationToken,
        emailVerified: false
      }).returning();
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "noreply@goatedvips.gg",
        to: email.toLowerCase(),
        subject: "Verify your GoatedVIPs account",
        html: `
          <h1>Welcome to GoatedVIPs!</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${process.env.APP_URL}/verify-email/${emailVerificationToken}">
            Verify Email
          </a>
        `
      });
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
  app.post("/api/auth/refresh", async (req, res) => {
    try {
      try {
        await tokenRefreshLimiter.consume(req.ip || "unknown");
      } catch (error) {
        return res.status(429).json({
          status: "error",
          message: "Too many refresh attempts. Please try again later."
        });
      }
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({
          status: "error",
          message: "Refresh token required",
          code: "REFRESH_TOKEN_REQUIRED"
        });
      }
      let payload;
      try {
        payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({
            status: "error",
            message: "Refresh token expired",
            code: "REFRESH_TOKEN_EXPIRED"
          });
        }
        return res.status(401).json({
          status: "error",
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN"
        });
      }
      const [user] = await db.select().from(users).where(eq5(users.id, payload.id)).limit(1);
      if (!user) {
        return res.status(401).json({
          status: "error",
          message: "User not found",
          code: "USER_NOT_FOUND"
        });
      }
      if (user.tokenVersion !== payload.tokenVersion) {
        return res.status(401).json({
          status: "error",
          message: "Token revoked",
          code: "TOKEN_REVOKED"
        });
      }
      const userData = {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        email: user.email,
        tokenVersion: user.tokenVersion || 0
      };
      const accessToken = generateAccessToken(userData);
      const newRefreshToken = generateRefreshToken(userData);
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1e3
        // 15 minutes
      });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        // Only sent with refresh requests
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      return res.json({
        status: "success",
        message: "Token refreshed successfully",
        data: {
          accessToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            isAdmin: user.isAdmin
          }
        }
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to refresh token",
        code: "REFRESH_ERROR"
      });
    }
  });
  app.get("/api/verify-email/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({
          status: "error",
          message: "Verification token is required"
        });
      }
      const [user] = await db.select().from(users).where(eq5(users.emailVerificationToken, token)).limit(1);
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired verification token"
        });
      }
      await db.update(users).set({
        emailVerified: true,
        emailVerificationToken: null,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(users.id, user.id));
      return res.json({
        status: "success",
        message: "Email verified successfully"
      });
    } catch (error) {
      console.error("Email verification error:", error);
      return res.status(500).json({
        status: "error",
        message: "Email verification failed"
      });
    }
  });
  app.post("/api/resend-verification", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          status: "error",
          message: "Not logged in"
        });
      }
      const user = req.user;
      if (user.emailVerified) {
        return res.status(400).json({
          status: "error",
          message: "Email is already verified"
        });
      }
      const emailVerificationToken = randomBytes(32).toString("hex");
      await db.update(users).set({
        emailVerificationToken,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(users.id, user.id));
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "noreply@goatedvips.gg",
        to: user.email,
        subject: "Verify your GoatedVIPs account",
        html: `
          <h1>Welcome to GoatedVIPs!</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${process.env.APP_URL}/verify-email/${emailVerificationToken}">
            Verify Email
          </a>
        `
      });
      return res.json({
        status: "success",
        message: "Verification email sent successfully"
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to resend verification email"
      });
    }
  });
  app.post("/api/password-reset/request", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required"
        });
      }
      try {
        await sensitiveOpLimiter.consume(req.ip || "unknown");
      } catch (error) {
        return res.status(429).json({
          status: "error",
          message: "Too many password reset attempts. Please try again later."
        });
      }
      const [user] = await db.select().from(users).where(eq5(users.email, email.toLowerCase())).limit(1);
      if (!user) {
        return res.json({
          status: "success",
          message: "If your email is registered, you will receive a password reset link"
        });
      }
      const passwordResetToken = randomBytes(32).toString("hex");
      const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1e3);
      await db.update(users).set({
        passwordResetToken,
        passwordResetExpires,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(users.id, user.id));
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "noreply@goatedvips.gg",
        to: email.toLowerCase(),
        subject: "Reset your GoatedVIPs password",
        html: `
          <h1>Password Reset Request</h1>
          <p>Click the link below to reset your password:</p>
          <a href="${process.env.APP_URL}/reset-password/${passwordResetToken}">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      return res.json({
        status: "success",
        message: "If your email is registered, you will receive a password reset link"
      });
    } catch (error) {
      console.error("Password reset request error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to process password reset request"
      });
    }
  });
  app.post("/api/password-reset/reset", async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({
          status: "error",
          message: "Token and new password are required"
        });
      }
      const [user] = await db.select().from(users).where(
        and3(
          eq5(users.passwordResetToken, token),
          eq5(users.passwordResetExpires !== null, true)
        )
      ).limit(1);
      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "Invalid or expired password reset token"
        });
      }
      if (user.passwordResetExpires && user.passwordResetExpires < /* @__PURE__ */ new Date()) {
        return res.status(400).json({
          status: "error",
          message: "Password reset token has expired"
        });
      }
      const hashedPassword = await hashPassword(password);
      const tokenVersion = (user.tokenVersion || 0) + 1;
      await db.update(users).set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        tokenVersion,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(users.id, user.id));
      return res.json({
        status: "success",
        message: "Password has been reset successfully"
      });
    } catch (error) {
      console.error("Password reset error:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to reset password"
      });
    }
  });
}
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashedPassword, salt] = stored.split(".");
  const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
  const suppliedPasswordBuf = await scryptAsync(
    supplied,
    salt,
    64
  );
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
}
function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      email: user.email,
      tokenVersion: user.tokenVersion || 0
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}
function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      tokenVersion: user.tokenVersion || 0
    },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}
function verifyJwtToken(req, res, next) {
  const publicPaths = [
    "/api/login",
    "/api/register",
    "/api/auth/refresh",
    "/api/verify-email",
    "/api/email-verification",
    "/api/password-reset/request",
    "/api/password-reset/verify",
    "/api/health",
    "/api/wager-races",
    "/api/affiliate"
  ];
  const isReplitWebView = req.headers["x-replit-user-id"] || req.headers["x-replit-user-name"] || process.env.NODE_ENV !== "production" && req.headers.referer?.includes("replit.dev");
  const isDevelopment = process.env.NODE_ENV !== "production";
  if (publicPaths.some((path5) => req.path.startsWith(path5)) || isDevelopment && (isReplitWebView || req.method === "GET")) {
    return next();
  }
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    token = req.cookies?.accessToken;
  }
  if (!token) {
    if (isDevelopment) {
      req.jwtUser = {
        id: 999,
        username: "dev-user",
        isAdmin: false,
        email: "dev@example.com"
      };
      return next();
    }
    return res.status(401).json({
      status: "error",
      message: "Authentication required"
    });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.jwtUser = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
      code: "INVALID_TOKEN"
    });
  }
}

// server/routes/email-verification.ts
var router5 = Router5();
function generateVerificationToken() {
  return crypto.randomBytes(40).toString("hex");
}
router5.post("/request", verifyJwtToken, async (req, res, next) => {
  try {
    const userId = req.jwtUser?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userResult = await db.select().from(users).where(eq6(users.id, userId)).limit(1);
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult[0];
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    const token = generateVerificationToken();
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    try {
      await db.update(users).set({
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt
      }).where(eq6(users.id, userId));
    } catch (error) {
      log(`Error updating verification token (expected during development): ${error instanceof Error ? error.message : String(error)}`, "email-verification", "warn");
    }
    await sendVerificationEmail(user.email, user.username, token);
    return res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    log(`Error in verification request: ${error instanceof Error ? error.message : String(error)}`, "email-verification", "error");
    return res.status(500).json({ message: "Failed to send verification email" });
  }
});
router5.get("/verify/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: "Invalid verification token" });
    }
    let userResult;
    try {
      userResult = await db.select().from(users).where(eq6(users.emailVerificationToken, token)).limit(1);
    } catch (error) {
      log(`Error looking up token (expected during development): ${error instanceof Error ? error.message : String(error)}`, "email-verification", "warn");
      return res.status(404).json({ message: "Invalid verification token or database schema mismatch" });
    }
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: "Invalid verification token" });
    }
    const user = userResult[0];
    const now = /* @__PURE__ */ new Date();
    if (user.emailVerificationExpires && user.emailVerificationExpires < now) {
      return res.status(400).json({ message: "Verification link has expired" });
    }
    try {
      await db.update(users).set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }).where(eq6(users.id, user.id));
    } catch (error) {
      log(`Error clearing verification token (expected during development): ${error instanceof Error ? error.message : String(error)}`, "email-verification", "warn");
      await db.update(users).set({
        emailVerified: true
      }).where(eq6(users.id, user.id));
    }
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    log(`Error in email verification: ${error instanceof Error ? error.message : String(error)}`, "email-verification", "error");
    return res.status(500).json({ message: "Failed to verify email" });
  }
});
router5.post("/resend", verifyJwtToken, async (req, res, next) => {
  try {
    const userId = req.jwtUser?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userResult = await db.select().from(users).where(eq6(users.id, userId)).limit(1);
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult[0];
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }
    const token = generateVerificationToken();
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    try {
      await db.update(users).set({
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt
      }).where(eq6(users.id, userId));
    } catch (error) {
      log(`Error updating verification token (expected during development): ${error instanceof Error ? error.message : String(error)}`, "email-verification", "warn");
    }
    await sendVerificationEmail(user.email, user.username, token);
    return res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    log(`Error in resending verification: ${error instanceof Error ? error.message : String(error)}`, "email-verification", "error");
    return res.status(500).json({ message: "Failed to resend verification email" });
  }
});
router5.get("/status", verifyJwtToken, async (req, res, next) => {
  try {
    const userId = req.jwtUser?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userResult = await db.select().from(users).where(eq6(users.id, userId)).limit(1);
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult[0];
    return res.status(200).json({
      verified: user.emailVerified,
      // Change from verified to emailVerified
      email: user.email
    });
  } catch (error) {
    log(`Error in checking verification status: ${error instanceof Error ? error.message : String(error)}`, "email-verification", "error");
    return res.status(500).json({ message: "Failed to check verification status" });
  }
});
var email_verification_default = router5;

// server/routes/goombas-admin.ts
init_db();
init_schema();
import { Router as Router6 } from "express";
import { count } from "drizzle-orm";

// server/middleware/admin.ts
import bcrypt2 from "bcrypt";
var ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
var ADMIN_KEY = process.env.ADMIN_SECRET_KEY || "";
var requireAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Admin access required" });
  }
};
var validateAdminCredentials = (username, password, secretKey) => {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD && secretKey === ADMIN_KEY;
};

// server/middleware/domain-router.ts
var adminDomainOnly = (req, res, next) => {
  const isReplitEnv = process.env.REPL_ID !== void 0;
  if (isReplitEnv) {
    return next();
  }
  if (!req.isAdminDomain) {
    return res.status(403).json({
      error: "Access denied",
      message: "This endpoint can only be accessed from the admin domain"
    });
  }
  next();
};

// server/routes/goombas-admin.ts
var router6 = Router6();
router6.post("/goombas.net/login", async (req, res) => {
  const { username, password, secretKey } = req.body;
  if (!username || !password || !secretKey) {
    return res.status(400).json({
      message: "Missing credentials",
      status: "error"
    });
  }
  const isValid = validateAdminCredentials(username, password, secretKey);
  if (isValid) {
    req.session.isAdmin = true;
    return res.status(200).json({
      message: "Authentication successful",
      status: "success"
    });
  } else {
    return res.status(401).json({
      message: "Invalid credentials",
      status: "error"
    });
  }
});
router6.post("/goombas.net/logout", requireAdmin, (req, res) => {
  req.session.isAdmin = false;
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Error during logout",
        status: "error"
      });
    }
    res.status(200).json({
      message: "Logout successful",
      status: "success"
    });
  });
});
router6.get("/analytics", [adminDomainOnly, requireAdmin], async (req, res) => {
  try {
    const userCount = await db.select({ count: count() }).from(users);
    const recentUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      createdAt: users.createdAt,
      isAdmin: users.isAdmin
    }).from(users).orderBy(users.createdAt).limit(10);
    const wheelSpinCount = await db.select({ count: count() }).from(wheelSpins);
    const bonusCodeCount = await db.select({ count: count() }).from(bonusCodes);
    const wagerRaceCount = await db.select({ count: count() }).from(wagerRaces);
    const wagerRaceParticipantCount = await db.select({ count: count() }).from(wagerRaceParticipants);
    const supportTicketCount = await db.select({ count: count() }).from(supportTickets);
    res.status(200).json({
      totalUsers: userCount[0]?.count || 0,
      recentUsers,
      stats: {
        wheelSpins: wheelSpinCount[0]?.count || 0,
        bonusCodes: bonusCodeCount[0]?.count || 0,
        wagerRaces: wagerRaceCount[0]?.count || 0,
        wagerRaceParticipants: wagerRaceParticipantCount[0]?.count || 0,
        supportTickets: supportTicketCount[0]?.count || 0
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      message: "Error fetching analytics",
      status: "error"
    });
  }
});
router6.get("/goombas.net/users", requireAdmin, async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Error fetching users",
      status: "error"
    });
  }
});
router6.get("/goombas.net/users/:id", requireAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({
      message: "Invalid user ID",
      status: "error"
    });
  }
  try {
    const user = await db.select().from(users).where(users.id === userId);
    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found",
        status: "error"
      });
    }
    res.status(200).json(user[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user",
      status: "error"
    });
  }
});
router6.get("/goombas.net/auth-status", (req, res) => {
  if (req.session.isAdmin) {
    res.status(200).json({
      isAdmin: true,
      status: "success"
    });
  } else {
    res.status(401).json({
      isAdmin: false,
      status: "error"
    });
  }
});
var goombas_admin_default = router6;

// server/routes/api-sync.ts
init_db();
init_schema();
import { Router as Router7 } from "express";
import { sql as sql8 } from "drizzle-orm";
import { eq as eq7, desc as desc3 } from "drizzle-orm";
init_vite();
async function syncUserProfiles() {
  console.log("Fetching leaderboard data for manual sync...");
  const token = process.env.API_TOKEN || API_CONFIG.token;
  if (!token) {
    throw new Error("API token not configured");
  }
  const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
  }
  const rawData = await response.json();
  let allTimeData = [];
  if (Array.isArray(rawData)) {
    allTimeData = rawData;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    allTimeData = rawData.data;
  } else if (rawData.results && Array.isArray(rawData.results)) {
    allTimeData = rawData.results;
  } else {
    console.log("Unexpected data format, checking for arrays");
    const possibleArrays = Object.values(rawData).filter((value) => Array.isArray(value));
    if (possibleArrays.length > 0) {
      allTimeData = possibleArrays.reduce((a, b) => a.length > b.length ? a : b);
    }
  }
  const activeUsers = await db.select({ goatedId: users.goatedId }).from(users).where(eq7(users.isActive, true)).orderBy(desc3(users.lastActive));
  console.log(`Found ${activeUsers.length} active users to prioritize for updates`);
  const activeGoatedIds = new Set(activeUsers.map((u) => u.goatedId).filter(Boolean));
  let usersToUpdate = allTimeData.filter(
    (player) => player.uid && activeGoatedIds.has(player.uid)
  );
  console.log(`Found ${usersToUpdate.length} active users in API data`);
  const potentialNewActiveUsers = allTimeData.filter(
    (player) => player.uid && !activeGoatedIds.has(player.uid) && player.wagered?.all_time > 0
  );
  if (potentialNewActiveUsers.length > 0) {
    console.log(`Found ${potentialNewActiveUsers.length} potential new active users`);
    usersToUpdate = [...usersToUpdate, ...potentialNewActiveUsers];
  }
  console.log(`Manual sync is updating ${usersToUpdate.length} users (${activeGoatedIds.size} active users)`);
  let updatedCount = 0;
  for (const player of usersToUpdate) {
    try {
      if (!player.uid || !player.name) continue;
      const totalWager = player.wagered?.all_time || 0;
      const wagerToday = player.wagered?.today || 0;
      const wagerWeek = player.wagered?.this_week || 0;
      const wagerMonth = player.wagered?.this_month || 0;
      const existingUser = await db.select().from(users).where(sql8`goated_id = ${player.uid}`).limit(1);
      if (existingUser && existingUser.length > 0) {
        await db.execute(sql8`
          UPDATE users 
          SET 
            goated_username = ${player.name},
            total_wager = ${totalWager},
            wager_today = ${wagerToday},
            wager_week = ${wagerWeek},
            wager_month = ${wagerMonth},
            lastActive = NOW(),
            is_active = ${totalWager > 0}
          WHERE goated_id = ${player.uid}
        `);
        updatedCount++;
      }
    } catch (error) {
      console.error(`Error updating user ${player?.name}:`, error);
    }
  }
  console.log(`Manual sync completed. ${updatedCount} profiles updated.`);
  return { updated: updatedCount, total: allTimeData.length };
}
var router7 = Router7();
router7.use(requireAdmin);
router7.get("/history", async (_req, res) => {
  try {
    const syncRecords = await db.query.apiSyncMetadata.findMany({
      orderBy: [desc3(apiSyncMetadata.last_sync_time)],
      limit: 50
    });
    res.json({
      status: "success",
      data: syncRecords
    });
  } catch (error) {
    console.error("Error fetching sync history:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sync history",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
router7.get("/status", async (_req, res) => {
  try {
    const [lastSync] = await db.query.apiSyncMetadata.findMany({
      orderBy: [desc3(apiSyncMetadata.last_sync_time)],
      limit: 1
    });
    const timeSinceSync = lastSync ? Date.now() - lastSync.last_sync_time.getTime() : null;
    const timeSinceSyncMinutes = timeSinceSync ? Math.floor(timeSinceSync / (1e3 * 60)) : null;
    res.json({
      status: "success",
      data: {
        lastSync,
        timeSinceSyncMs: timeSinceSync,
        timeSinceSyncMinutes,
        timeSinceSyncFormatted: timeSinceSyncMinutes ? `${timeSinceSyncMinutes} minute${timeSinceSyncMinutes !== 1 ? "s" : ""} ago` : "Never synced"
      }
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch sync status",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
router7.get("/user-stats", async (_req, res) => {
  try {
    const [userCount] = await db.select({ count: sql8`count(*)` }).from(users);
    const [userWithGoatedIds] = await db.select({ count: sql8`count(*)` }).from(users).where(sql8`goated_id IS NOT NULL`);
    const [usersWithWagerData] = await db.select({ count: sql8`count(*)` }).from(users).where(sql8`wagered_all_time > 0`);
    res.json({
      status: "success",
      data: {
        totalUsers: userCount.count,
        usersWithGoatedIds: userWithGoatedIds.count,
        usersWithWagerData: usersWithWagerData.count,
        percentWithGoatedIds: userCount.count ? Math.round(Number(userWithGoatedIds.count) / Number(userCount.count) * 100) : 0,
        percentWithWagerData: userCount.count ? Math.round(Number(usersWithWagerData.count) / Number(userCount.count) * 100) : 0
      }
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user stats",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
router7.post("/trigger", async (_req, res) => {
  try {
    log2("Manual sync triggered via API");
    const syncPromise = syncUserProfiles();
    res.json({
      status: "success",
      message: "Sync process initiated",
      note: "The sync is running in the background. Check status endpoints for completion."
    });
    syncPromise.then(() => {
      log2("Manual sync completed successfully");
    }).catch((error) => {
      log2(`Manual sync failed: ${error.message}`);
    });
  } catch (error) {
    console.error("Error triggering sync:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to trigger sync",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});
var api_sync_default = router7;

// server/routes.ts
init_schema();
import cookieParser from "cookie-parser";
import { eq as eq9 } from "drizzle-orm";
import { z as z3 } from "zod";
var rateLimits = {
  HIGH: { points: 30, duration: 60 },
  MEDIUM: { points: 15, duration: 60 },
  LOW: { points: 5, duration: 60 }
};
var rateLimiters = {
  high: new RateLimiterMemory3(rateLimits.HIGH),
  medium: new RateLimiterMemory3(rateLimits.MEDIUM),
  low: new RateLimiterMemory3(rateLimits.LOW)
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
var cacheMiddleware = (ttl = 3e4) => async (req, res, next) => {
  const key = req.originalUrl;
  const cachedResponse = cacheManager.get(key);
  if (cachedResponse) {
    res.setHeader("X-Cache", "HIT");
    return res.json(cachedResponse);
  }
  res.originalJson = res.json;
  res.json = (body) => {
    cacheManager.set(key, body);
    return res.originalJson(body);
  };
  next();
};
var CacheManager = class {
  cache;
  defaultTTL;
  constructor(defaultTTL = 3e4) {
    this.cache = /* @__PURE__ */ new Map();
    this.defaultTTL = defaultTTL;
  }
  generateKey(req) {
    return `${req.method}-${req.originalUrl}-${JSON.stringify(req.query)}`;
  }
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  clear() {
    this.cache.clear();
  }
};
var router8 = Router8();
router8.use(compression());
var CACHE_TIMES = {
  SHORT: 15e3,
  // 15 seconds
  MEDIUM: 6e4,
  // 1 minute
  LONG: 3e5
  // 5 minutes
};
router8.get("/health", async (_req, res) => {
  try {
    await db.execute(sql10`SELECT 1`);
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
      message: process.env.NODE_ENV === "production" ? "Health check failed" : error.message
    });
  }
});
router8.get(
  "/wager-races/current",
  createRateLimiter("high"),
  cacheMiddleware(CACHE_TIMES.SHORT),
  async (_req, res) => {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) {
        return res.json(getDefaultRaceData());
      }
      const rawData = await response.json();
      const stats = await transformLeaderboardData(rawData);
      const raceData = formatRaceData(stats);
      res.json(raceData);
    } catch (error) {
      console.error("Error in /wager-races/current:", error);
      res.status(200).json(getDefaultRaceData());
    }
  }
);
function getDefaultRaceData() {
  const year = 2025;
  const marchMonth = 2;
  return {
    id: `${year}03`,
    // 03 for March
    status: "live",
    startDate: new Date(year, marchMonth, 1).toISOString(),
    endDate: new Date(year, marchMonth + 1, 0, 23, 59, 59).toISOString(),
    prizePool: 500,
    participants: []
  };
}
function formatRaceData(stats) {
  const year = 2025;
  const month = 2;
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
  const monthlyData = stats?.data?.monthly?.data ?? [];
  return {
    id: `${year}${(month + 1).toString().padStart(2, "0")}`,
    // 202503 for March 2025
    status: "live",
    startDate: new Date(year, month, 1).toISOString(),
    endDate: endOfMonth.toISOString(),
    prizePool: 500,
    participants: monthlyData.map((participant, index) => ({
      uid: participant?.uid ?? "",
      name: participant?.name ?? "Unknown",
      wagered: Number(participant?.wagered?.this_month ?? 0),
      position: index + 1
    })).slice(0, 10)
  };
}
function setupAPIRoutes(app) {
  app.use(cookieParser());
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use("/api", verifyJwtToken);
  app.use("/api/bonus", bonus_challenges_default);
  app.use("/api/users", users_default);
  app.use("/users", users_default);
  app.use("/api/user", user_stats_default);
  app.use("/api/verification", verification_default);
  app.use("/api/email-verification", email_verification_default);
  app.use("/api/sync", api_sync_default);
  app.use("/api", router8);
  app.use("/goombas.net", goombas_admin_default);
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
          const existingUser = await db.select().from(users).where(sql10`username = ${user.username}`).limit(1);
          if (existingUser && existingUser.length > 0) {
            existingCount++;
            continue;
          }
          const randomId = 1e3 + Math.floor(Math.random() * 9e3);
          await db.execute(sql10`
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
        } catch (insertError) {
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
    "/api/affiliate/stats",
    createRateLimiter("medium"),
    cacheMiddleware(CACHE_TIMES.MEDIUM),
    async (req, res) => {
      try {
        const username = typeof req.query.username === "string" ? req.query.username : void 0;
        let url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
        if (username) {
          url += `?username=${encodeURIComponent(username)}`;
        }
        log2("Fetching affiliate stats from:", url);
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
            "Content-Type": "application/json"
          }
        });
        if (!response.ok) {
          if (response.status === 401) {
            log2("API Authentication failed - check API token");
            throw new ApiError("API Authentication failed", { status: 401 });
          }
          throw new ApiError(`API request failed: ${response.status}`, { status: response.status });
        }
        const rawData = await response.json();
        log2("Raw API response structure:", {
          hasData: Boolean(rawData),
          dataStructure: typeof rawData,
          keys: Object.keys(rawData),
          hasResults: Boolean(rawData?.results),
          resultsLength: rawData?.results?.length,
          hasSuccess: "success" in rawData,
          successValue: rawData?.success,
          nestedData: Boolean(rawData?.data),
          nestedDataLength: rawData?.data?.length
        });
        const transformedData = await transformLeaderboardData(rawData);
        log2("Transformed leaderboard data:", {
          status: transformedData.status,
          totalUsers: transformedData.metadata?.totalUsers,
          dataLengths: {
            today: transformedData.data?.today?.data?.length,
            weekly: transformedData.data?.weekly?.data?.length,
            monthly: transformedData.data?.monthly?.data?.length,
            allTime: transformedData.data?.all_time?.data?.length
          }
        });
        res.json(transformedData);
      } catch (error) {
        log2(`Error in /api/affiliate/stats: ${error}`);
        res.status(error instanceof ApiError ? error.status || 500 : 500).json({
          status: "error",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
          data: {
            today: { data: [] },
            weekly: { data: [] },
            monthly: { data: [] },
            all_time: { data: [] }
          }
        });
      }
    }
  );
  app.get(
    "/goated-supervisor/analytics",
    requireAdmin,
    // Ensure admin middleware is applied
    createRateLimiter("low"),
    cacheMiddleware(CACHE_TIMES.LONG),
    async (_req, res) => {
      try {
        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}`,
              "Content-Type": "application/json"
            }
          }
        );
        if (!response.ok) {
          throw new ApiError(`API request failed: ${response.status}`, { status: response.status });
        }
        const rawData = await response.json();
        const data = rawData.data || rawData.results || rawData;
        const totals = data.reduce((acc, entry) => {
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
          db.select({ count: sql10`count(*)` }).from(wagerRaces),
          db.select({ count: sql10`count(*)` }).from(wagerRaces).where(eq9(wagerRaces.status, "live"))
        ]);
        const { getUserActivityStats: getUserActivityStats2 } = await Promise.resolve().then(() => (init_user_activity(), user_activity_exports));
        const userActivity = await getUserActivityStats2();
        const stats = {
          totalRaces: raceCount[0].count,
          activeRaces: activeRaceCount[0].count,
          wagerTotals: totals,
          userActivity
        };
        res.json(stats);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch analytics" });
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
        const [lastSpin] = await db.select({ timestamp: sql10`MAX(timestamp)` }).from(sql10`wheel_spins`).where(sql10`user_id = ${req.user.id}`).limit(1);
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
          sql10`INSERT INTO wheel_spins (user_id, segment_index, reward_code, timestamp)
              VALUES (${req.user.id}, ${segmentIndex}, ${reward}, NOW())`
        );
        if (reward) {
          await db.execute(
            sql10`INSERT INTO bonus_codes (code, user_id, claimed_at, expires_at)
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
      try {
        console.log("Executing transformation metrics query...");
        const result = await db.query.transformationLogs.findMany({
          columns: {
            type: true,
            duration_ms: true,
            created_at: true
          },
          where: sql10`created_at > NOW() - INTERVAL '24 hours'`
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
        res.json(response);
      } catch (error) {
        console.error("Error in transformation metrics endpoint:", {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.name
          } : error,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        res.status(500).json({
          status: "error",
          message: "Failed to fetch transformation metrics",
          details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : void 0
        });
      }
    }
  );
  app.get(
    "/api/admin/export-logs",
    createRateLimiter("low"),
    async (_req, res) => {
      try {
        console.log("Fetching logs for export...");
        const logs = await db.query.transformationLogs.findMany({
          orderBy: (logs2, { desc: desc5 }) => [desc5(logs2.created_at)],
          limit: 1e3
          // Limit to last 1000 logs
        });
        console.log(`Found ${logs.length} logs to export`);
        const formattedLogs = logs.map((log3) => ({
          timestamp: log3.created_at.toISOString(),
          type: log3.type,
          message: log3.message,
          duration_ms: log3.duration_ms?.toString() || "",
          resolved: log3.resolved ? "Yes" : "No",
          error_message: log3.error_message || "",
          payload: log3.payload ? JSON.stringify(log3.payload) : ""
        }));
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=transformation_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
        const csvData = [
          // Header row
          Object.keys(formattedLogs[0] || {}).join(","),
          // Data rows
          ...formattedLogs.map(
            (log3) => Object.values(log3).map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
          )
        ].join("\n");
        res.send(csvData);
      } catch (error) {
        console.error("Error exporting logs:", error);
        res.status(500).json({
          status: "error",
          message: "Failed to export logs",
          details: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : void 0
        });
      }
    }
  );
}
function transformLeaderboardData(apiData) {
  const data = apiData.data || apiData.results || apiData;
  if (!Array.isArray(data)) {
    return {
      status: "success",
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
  const todayData = [...data].sort((a, b) => (b.wagered.today || 0) - (a.wagered.today || 0));
  const weeklyData = [...data].sort((a, b) => (b.wagered.this_week || 0) - (a.wagered.this_week || 0));
  const monthlyData = [...data].sort((a, b) => (b.wagered.this_month || 0) - (a.wagered.this_month || 0));
  const allTimeData = [...data].sort((a, b) => (b.wagered.all_time || 0) - (a.wagered.all_time || 0));
  return {
    status: "success",
    metadata: {
      totalUsers: data.length,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    },
    data: {
      today: { data: todayData },
      weekly: { data: weeklyData },
      monthly: { data: monthlyData },
      all_time: { data: allTimeData }
    }
  };
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
  log2(`Leaderboard WebSocket client connected (${clientId})`);
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
    log2(`WebSocket error (${clientId}): ${error.message}`);
    clearInterval(pingInterval);
    ws.terminate();
  });
  ws.on("close", () => {
    log2(`Leaderboard WebSocket client disconnected (${clientId})`);
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
  log2(`Transformation logs WebSocket client connected (${clientId})`);
  if (ws.readyState === WebSocket2.OPEN) {
    ws.send(JSON.stringify({
      type: "CONNECTED",
      clientId,
      timestamp: Date.now()
    }));
    db.select().from(transformationLogs).orderBy(sql10`created_at DESC`).limit(50).then((logs) => {
      if (ws.readyState === WebSocket2.OPEN) {
        ws.send(JSON.stringify({
          type: "INITIAL_LOGS",
          logs: logs.map((log3) => ({
            ...log3,
            timestamp: log3.created_at.toISOString()
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
    log2(`Transformation logs WebSocket client disconnected (${clientId})`);
  });
  ws.on("error", (error) => {
    log2(`WebSocket error (${clientId}): ${error.message}`);
    clearInterval(pingInterval);
    ws.terminate();
  });
}
var cacheManager = new CacheManager();
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
              }
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
var wheelSpinSchema = z3.object({
  segmentIndex: z3.number(),
  reward: z3.string().nullable()
});
var ApiError = class extends Error {
  status;
  code;
  constructor(message, options) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
  }
};

// server/middleware/domain-handler.ts
var domainRedirectMiddleware = (req, res, next) => {
  const hostname = req.hostname;
  const isReplitEnv = process.env.REPL_ID !== void 0;
  log(`Request hostname: ${hostname}, Replit env: ${isReplitEnv}`, "domain-handler");
  if (isReplitEnv) {
    req.isAdminDomain = false;
    req.isPublicDomain = true;
    if (hostname.includes("goombas") || hostname.includes("admin")) {
      req.isAdminDomain = true;
    }
  } else {
    req.isAdminDomain = hostname === "goombas.net" || hostname.includes("goombas.net");
    req.isPublicDomain = hostname === "goatedvips.gg" || hostname.includes("goatedvips.gg") || hostname.includes("goatedvips.replit.app");
  }
  if (!isReplitEnv) {
    if (req.isAdminDomain) {
      res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; frame-ancestors 'none';");
    }
  }
  next();
};

// server/index.ts
init_db();
init_schema();

// server/config/paths.ts
import path3 from "path";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
var rootDir = path3.resolve(__dirname3, "..", "..");
var PATHS2 = {
  // Project structure
  root: rootDir,
  // Client paths
  clientSrc: path3.resolve(rootDir, "client", "src"),
  clientBuild: path3.resolve(rootDir, "dist", "public"),
  clientIndex: path3.resolve(rootDir, "client", "index.html"),
  adminIndex: path3.resolve(rootDir, "client", "admin.html"),
  // Added admin HTML path
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
var REPLIT_DOMAIN = process.env.REPLIT_DOMAINS || "";
var SESSION_SECRET = process.env.SESSION_SECRET || "your-secret-key";
var COOKIE_SECURE = IS_PRODUCTION;
var COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1e3;
var IS_REPLIT = process.env.REPL_ID !== void 0;
var CORS_ORIGINS = IS_DEVELOPMENT || IS_REPLIT ? ["http://localhost:5000", "http://0.0.0.0:5000", "https://*.replit.app", "https://*.repl.co", "*"] : process.env.ALLOWED_ORIGINS?.split(",") || [];
var API_TOKEN = process.env.API_TOKEN;
var DATABASE_URL = process.env.DATABASE_URL;
var ENV = {
  NODE_ENV,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  PORT,
  BOT_PORT,
  VITE_PORT,
  HOST,
  REPLIT_DOMAIN,
  IS_REPLIT,
  SESSION_SECRET,
  COOKIE_SECURE,
  COOKIE_MAX_AGE,
  CORS_ORIGINS,
  API_TOKEN,
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
var execAsync = promisify2(exec);
var __filename4 = fileURLToPath4(import.meta.url);
var __dirname4 = path4.dirname(__filename4);
var { PORT: PORT2, HOST: HOST2, IS_DEVELOPMENT: IS_DEVELOPMENT2, IS_PRODUCTION: IS_PRODUCTION2, CORS_ORIGINS: CORS_ORIGINS2, SESSION_SECRET: SESSION_SECRET2, COOKIE_SECURE: COOKIE_SECURE2, COOKIE_MAX_AGE: COOKIE_MAX_AGE2, API_TOKEN: API_TOKEN2, DATABASE_URL: DATABASE_URL2 } = ENV;
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
    await db.execute(sql11`SELECT 1`);
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
      const results = await db.execute(sql11`
        SELECT id, username, goated_id as "goatedId", goated_username as "goatedUsername"
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
      const results = await db.execute(sql11`
        SELECT id, username, goated_id as "goatedId", goated_username as "goatedUsername"
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
      const token = API_TOKEN2 || API_CONFIG.token;
      let userData = null;
      if (token) {
        try {
          const leaderboardUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
          console.log(`Fetching leaderboard data to find user ${userId}`);
          const response = await fetch(leaderboardUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
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
          const totalWager = userData.wagered?.all_time || 0;
          const wagerToday = userData.wagered?.today || 0;
          const wagerWeek = userData.wagered?.this_week || 0;
          const wagerMonth = userData.wagered?.this_month || 0;
          console.log(`Creating profile with wager data:`, {
            total: totalWager,
            today: wagerToday,
            week: wagerWeek,
            month: wagerMonth
          });
          const result = await db.execute(sql11`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, 
              -- New schema fields
              uid, total_wager, wager_today, wager_week, wager_month, verified,
              -- Legacy fields for backward compatibility
              goated_id, goated_username, goated_account_linked
            ) VALUES (
              ${newUserId}, ${username}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
              'Official Goated.com player profile', false, 
              -- New schema field values
              ${userId}, ${totalWager}, ${wagerToday}, ${wagerWeek}, ${wagerMonth}, true,
              -- Legacy field values
              ${userId}, ${username}, true
            ) RETURNING id, username, uid, goated_id as "goatedId", goated_username as "goatedUsername", 
              total_wager as "totalWager", wager_today as "wagerToday", 
              wager_week as "wagerWeek", wager_month as "wagerMonth"
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
          const tempUsername = `Goated User ${userId}`;
          const email = `user_${userId}@goated.placeholder.com`;
          const result = await db.execute(sql11`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, 
              -- New schema fields
              uid, total_wager, wager_today, wager_week, wager_month, verified,
              -- Legacy fields
              goated_id, goated_account_linked
            ) VALUES (
              ${newUserId}, ${tempUsername}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
              'Temporary profile - this player has not been verified with Goated.com yet', false,
              -- New schema field values (initialize with zeros for wager fields)
              ${userId}, 0, 0, 0, 0, false,
              -- Legacy field values
              ${userId}, false
            ) RETURNING id, username, uid, goated_id as "goatedId", goated_username as "goatedUsername",
              total_wager as "totalWager", wager_today as "wagerToday", 
              wager_week as "wagerWeek", wager_month as "wagerMonth"
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
        const username = `Goated Custom ${shortId}`;
        const email = `custom_${shortId}@goated.placeholder.com`;
        const result = await db.execute(sql11`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, 
            bio, is_admin, 
            -- New schema fields
            uid, total_wager, wager_today, wager_week, wager_month, verified,
            -- Legacy fields
            goated_id, goated_account_linked
          ) VALUES (
            ${newUserId}, ${username}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
            'Custom profile - not linked to Goated.com', false,
            -- New schema field values
            ${userId}, 0, 0, 0, 0, false,
            -- Legacy field values
            ${userId}, false
          ) RETURNING id, username, uid, goated_id as "goatedId", goated_username as "goatedUsername",
            total_wager as "totalWager", wager_today as "wagerToday", 
            wager_week as "wagerWeek", wager_month as "wagerMonth"
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
async function syncUserProfiles2() {
  try {
    console.log("Starting optimized user profile sync...");
    const token = API_TOKEN2 || API_CONFIG.token;
    if (!token) {
      console.warn("API token not configured, skipping profile sync");
      return;
    }
    const startTime = Date.now();
    const endpointKey = API_CONFIG.endpoints.leaderboard;
    const url = `${API_CONFIG.baseUrl}${endpointKey}`;
    const syncMetadata = await db.execute(sql11`
      SELECT * FROM api_sync_metadata 
      WHERE endpoint = ${endpointKey} 
      ORDER BY last_sync_time DESC 
      LIMIT 1
    `);
    const lastSync = syncMetadata.rows && syncMetadata.rows.length > 0 ? syncMetadata.rows[0] : null;
    let headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    };
    if (lastSync) {
      if (lastSync.etag) {
        headers["If-None-Match"] = lastSync.etag;
      }
      if (lastSync.last_modified) {
        headers["If-Modified-Since"] = lastSync.last_modified;
      }
    }
    console.log(`Fetching leaderboard data from: ${url}`);
    const response = await fetch(url, { headers });
    if (response.status === 304) {
      console.log("API data unchanged since last sync (304 Not Modified)");
      await db.execute(sql11`
        INSERT INTO api_sync_metadata (
          endpoint, last_sync_time, record_count, etag, last_modified,
          response_hash, is_full_sync, sync_duration_ms, metadata
        ) VALUES (
          ${endpointKey}, ${/* @__PURE__ */ new Date()}, ${lastSync.record_count}, 
          ${lastSync.etag}, ${lastSync.last_modified}, ${lastSync.response_hash},
          false, ${Date.now() - startTime}, ${{
        skippedReason: "304 Not Modified",
        usersInLastSync: lastSync.record_count
      }}
        )
      `);
      console.log(`Quick sync completed. No changes detected from last sync (${lastSync.record_count} users).`);
      return;
    }
    if (!response.ok) {
      console.error(`Failed to fetch leaderboard data: ${response.status}`);
      return;
    }
    const responseEtag = response.headers.get("etag");
    const responseLastModified = response.headers.get("last-modified");
    const rawData = await response.json();
    const responseJSON = JSON.stringify(rawData);
    const responseHash = await generateSimpleHash(responseJSON);
    if (lastSync && lastSync.response_hash === responseHash) {
      console.log("API data unchanged since last sync (hash match)");
      await db.execute(sql11`
        INSERT INTO api_sync_metadata (
          endpoint, last_sync_time, record_count, etag, last_modified,
          response_hash, is_full_sync, sync_duration_ms, metadata
        ) VALUES (
          ${endpointKey}, ${/* @__PURE__ */ new Date()}, ${lastSync.record_count}, 
          ${responseEtag || lastSync.etag}, ${responseLastModified || lastSync.last_modified}, 
          ${responseHash}, false, ${Date.now() - startTime}, ${{
        skippedReason: "Hash match",
        usersInLastSync: lastSync.record_count
      }}
        )
      `);
      console.log(`Quick sync completed. No changes detected from content hash (${lastSync.record_count} users).`);
      return;
    }
    let leaderboardData;
    if (rawData.data && rawData.data.all_time) {
      leaderboardData = rawData;
      console.log("Using standard nested format with all_time data");
    } else if (Array.isArray(rawData)) {
      leaderboardData = {
        data: {
          all_time: {
            data: rawData
          }
        }
      };
      console.log("Using direct array format");
    } else if (rawData.results && Array.isArray(rawData.results)) {
      leaderboardData = {
        data: {
          all_time: {
            data: rawData.results
          }
        }
      };
      console.log("Using results array format");
    } else if (typeof rawData === "object" && rawData !== null) {
      const possibleArrays = Object.values(rawData).filter((value) => Array.isArray(value));
      if (possibleArrays.length > 0) {
        const longestArray = possibleArrays.reduce((a, b) => a.length > b.length ? a : b);
        leaderboardData = {
          data: {
            all_time: {
              data: longestArray
            }
          }
        };
        console.log(`Found array with ${longestArray.length} items in response`);
      } else {
        console.error("No usable arrays found in response:", Object.keys(rawData));
        return;
      }
    } else {
      console.error("Unknown API response format:", typeof rawData, Object.keys(rawData || {}));
      return;
    }
    const allTimeData = leaderboardData?.data?.all_time?.data || [];
    let createdCount = 0;
    let existingCount = 0;
    let updatedCount = 0;
    const userCountResult = await db.execute(sql11`SELECT COUNT(*) FROM users WHERE goated_id IS NOT NULL`);
    const currentUserCount = parseInt(userCountResult.rows[0].count, 10) || 0;
    console.log(`Current user count in database: ${currentUserCount}`);
    console.log(`Users in API response: ${allTimeData.length}`);
    if (lastSync && lastSync.is_full_sync && Math.abs(currentUserCount - allTimeData.length) < 10 && allTimeData.length > 0) {
      const activeUsers = await db.select({ goatedId: users.goatedId }).from(users).where(gt3(users.total_wager, 0)).orderBy(desc4(users.lastActive));
      const activeGoatedIds = new Set(activeUsers.map((u) => u.goatedId).filter(Boolean));
      let usersToUpdate = allTimeData.filter(
        (player) => player.uid && activeGoatedIds.has(player.uid)
      );
      console.log(`Found ${usersToUpdate.length} active users in API data`);
      const potentialNewActiveUsers = allTimeData.filter(
        (player) => player.uid && !activeGoatedIds.has(player.uid) && player.wagered?.all_time > 0
      );
      console.log(`Found ${potentialNewActiveUsers.length} potential new active users`);
      for (const player of usersToUpdate) {
        try {
          if (!player.uid || !player.name) continue;
          const totalWager = player.wagered?.all_time || 0;
          const wagerToday = player.wagered?.today || 0;
          const wagerWeek = player.wagered?.this_week || 0;
          const wagerMonth = player.wagered?.this_month || 0;
          const existingUser = await db.select().from(users).where(sql11`goated_id = ${player.uid}`).limit(1);
          if (existingUser && existingUser.length > 0) {
            await db.execute(sql11`
              UPDATE users 
              SET 
                goated_username = ${player.name},
                total_wager = ${totalWager},
                wager_today = ${wagerToday},
                wager_week = ${wagerWeek},
                wager_month = ${wagerMonth},
                is_active = ${totalWager > 0}
              WHERE goated_id = ${player.uid}
            `);
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error updating sample user ${player?.name}:`, error);
        }
      }
      const activityResult = await updateUserActivityStatus2();
      await db.execute(sql11`
        INSERT INTO api_sync_metadata (
          endpoint, last_sync_time, record_count, etag, last_modified,
          response_hash, is_full_sync, sync_duration_ms, metadata
        ) VALUES (
          ${endpointKey}, ${/* @__PURE__ */ new Date()}, ${allTimeData.length}, 
          ${responseEtag || lastSync.etag}, ${responseLastModified || lastSync.last_modified}, 
          ${responseHash}, false, ${Date.now() - startTime}, ${{
        partialSync: true,
        activeUserCount: usersToUpdate.length,
        updatedCount,
        activityUpdates: activityResult.updated,
        activeUsers: activityResult.active,
        inactiveUsers: activityResult.inactive
      }}
        )
      `);
      console.log(`Partial sync completed. ${updatedCount} active user profiles updated of ${usersToUpdate.length} available.`);
      return;
    }
    console.log(`Performing full sync with ${allTimeData.length} users from leaderboard`);
    for (const player of allTimeData) {
      try {
        if (!player.uid || !player.name) continue;
        const totalWager = player.wagered?.all_time || 0;
        const wagerToday = player.wagered?.today || 0;
        const wagerWeek = player.wagered?.this_week || 0;
        const wagerMonth = player.wagered?.this_month || 0;
        const existingUser = await db.select().from(users).where(sql11`goated_id = ${player.uid}`).limit(1);
        if (existingUser && existingUser.length > 0) {
          try {
            await db.execute(sql11`
              UPDATE users 
              SET 
                goated_username = ${player.name},
                goated_account_linked = true,
                -- New schema fields
                uid = ${player.uid},
                total_wager = ${totalWager},
                wager_today = ${wagerToday},
                wager_week = ${wagerWeek},
                wager_month = ${wagerMonth},
                verified = true,
                is_active = ${totalWager > 0}
              WHERE goated_id = ${player.uid}
            `);
            updatedCount++;
            existingCount++;
            continue;
          } catch (error) {
            console.error(`Error updating user ${player.name} (goatedId: ${player.uid}):`, error);
          }
        }
        const uidHash = player.uid.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const newUserId = 1e4 + uidHash % 9e4;
        const email = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@goated.placeholder.com`;
        try {
          await db.execute(sql11`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, 
              -- Legacy fields
              goated_id, goated_username, goated_account_linked,
              -- New schema fields
              uid, total_wager, wager_today, wager_week, wager_month, verified, is_active
            ) VALUES (
              ${newUserId}, ${player.name}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
              'Official Goated.com player profile', false, 
              -- Legacy fields values
              ${player.uid}, ${player.name}, true,
              -- New schema fields values
              ${player.uid}, ${totalWager}, ${wagerToday}, ${wagerWeek}, ${wagerMonth}, true, ${totalWager > 0}
            )
          `);
          console.log(`Created new user profile for ${player.name} (UID: ${player.uid})`);
          createdCount++;
        } catch (error) {
          if (error.code === "23505" && error.constraint === "users_pkey") {
            const altId = 1e5 + Math.floor(Math.random() * 9e5);
            try {
              await db.execute(sql11`
                INSERT INTO users (
                  id, username, email, password, created_at, profile_color, 
                  bio, is_admin, 
                  -- Legacy fields
                  goated_id, goated_username, goated_account_linked,
                  -- New schema fields
                  uid, total_wager, wager_today, wager_week, wager_month, verified, is_active
                ) VALUES (
                  ${altId}, ${player.name}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
                  'Official Goated.com player profile', false, 
                  -- Legacy fields values
                  ${player.uid}, ${player.name}, true,
                  -- New schema fields values
                  ${player.uid}, ${totalWager}, ${wagerToday}, ${wagerWeek}, ${wagerMonth}, true, ${totalWager > 0}
                )
              `);
              console.log(`Created new user profile with alt ID for ${player.name} (UID: ${player.uid})`);
              createdCount++;
            } catch (innerError) {
              console.error(`Failed to create user with alternative ID for ${player.name}:`, innerError);
            }
          } else {
            console.error(`Error creating user ${player.name} (goatedId: ${player.uid}):`, error);
          }
        }
      } catch (error) {
        console.error(`Error creating/updating profile for ${player?.name}:`, error);
      }
    }
    const syncDuration = Date.now() - startTime;
    await db.execute(sql11`
      INSERT INTO api_sync_metadata (
        endpoint, last_sync_time, record_count, etag, last_modified,
        response_hash, is_full_sync, sync_duration_ms, metadata
      ) VALUES (
        ${endpointKey}, ${/* @__PURE__ */ new Date()}, ${allTimeData.length}, 
        ${responseEtag}, ${responseLastModified}, ${responseHash},
        true, ${syncDuration}, ${{
      fullSync: true,
      created: createdCount,
      updated: updatedCount,
      existing: existingCount,
      durationMs: syncDuration
    }}
      )
    `);
    console.log(`Full profile sync completed in ${syncDuration}ms. Created ${createdCount} new profiles, updated ${updatedCount}, ${existingCount} already existed.`);
  } catch (error) {
    console.error("Error syncing profiles from leaderboard:", error);
  }
}
async function generateSimpleHash(str) {
  if (str.length === 0) return "empty";
  const len = str.length;
  const start = str.substring(0, Math.min(100, len));
  const middle = len > 200 ? str.substring(Math.floor(len / 2) - 50, Math.floor(len / 2) + 50) : "";
  const end = len > 100 ? str.substring(len - 100) : "";
  return `len:${len}|start:${start}|mid:${middle}|end:${end}`;
}
async function initializeServer() {
  try {
    log("info", "Startingserver initialization...");
    await waitForPort(PORT2);
    log("info", "Port available, proceeding with initialization");
    await testDbConnection();
    log("info", "Database connection established");
    await syncUserProfiles2();
    log("info", "User profiles synchronized");
    const app = express2();
    setupMiddleware(app);
    setupAuth(app);
    registerRoutes(app);
    log("info", "Admin routes initialized");
    server = createServer2(app);
    setupWebSocket2(server);
    if (IS_DEVELOPMENT2) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    app.use((err, _req, res, _next) => {
      console.error("Server error:", err);
      res.status(500).json({
        error: IS_PRODUCTION2 ? "Internal Server Error" : err.message
      });
    });
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
  const isReplitEnv = process.env.REPL_ID !== void 0;
  app.use(cors({
    origin: "*",
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
      secure: isReplitEnv ? false : COOKIE_SECURE2,
      // Don't use secure cookies in Replit for development
      sameSite: isReplitEnv ? "none" : "lax",
      // Allow cross-site cookies in Replit
      httpOnly: true,
      maxAge: COOKIE_MAX_AGE2
    }
  }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (isReplitEnv) {
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
    } else {
      res.setHeader("X-Frame-Options", "DENY");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });
  app.use(express2.json({ limit: "1mb" }));
  app.use(express2.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser2());
  app.use(requestLogger);
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });
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
  const distPath = PATHS2.clientBuild;
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
  if (process.env.REPL_ID) {
    process.env.ALLOWED_HOSTS = ".replit.dev,.replit.app,.repl.co,.spock.replit.dev";
  }
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
async function updateUserActivityStatus2() {
  const updatedCount = 0;
  const activeCount = 0;
  const inactiveCount = 0;
  return { updated: updatedCount, active: activeCount, inactive: inactiveCount };
}
export {
  ensureUserProfile
};
