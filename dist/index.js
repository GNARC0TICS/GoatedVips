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
  bonusCodeRelations: () => bonusCodeRelations,
  bonusCodes: () => bonusCodes,
  goatedWagerLeaderboard: () => goatedWagerLeaderboard,
  historicalRaces: () => historicalRaces,
  insertAffiliateStatsSchema: () => insertAffiliateStatsSchema,
  insertBonusCodeSchema: () => insertBonusCodeSchema,
  insertHistoricalRaceSchema: () => insertHistoricalRaceSchema,
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
  mockWagerData: () => mockWagerData,
  mockWagerDataRelations: () => mockWagerDataRelations,
  newsletterSubscriptions: () => newsletterSubscriptions,
  notificationPreferences: () => notificationPreferences,
  selectAffiliateStatsSchema: () => selectAffiliateStatsSchema,
  selectBonusCodeSchema: () => selectBonusCodeSchema,
  selectHistoricalRaceSchema: () => selectHistoricalRaceSchema,
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
var users, userRelations, insertUserSchema, selectUserSchema, wheelSpins, bonusCodes, wagerRaces, wagerRaceParticipants, supportTickets, ticketMessages, wheelSpinRelations, bonusCodeRelations, wagerRaceRelations, wagerRaceParticipantRelations, supportTicketRelations, ticketMessageRelations, insertWheelSpinSchema, selectWheelSpinSchema, insertBonusCodeSchema, selectBonusCodeSchema, insertWagerRaceSchema, selectWagerRaceSchema, insertWagerRaceParticipantSchema, selectWagerRaceParticipantSchema, insertSupportTicketSchema, selectSupportTicketSchema, insertTicketMessageSchema, selectTicketMessageSchema, historicalRaces, newsletterSubscriptions, notificationPreferences, affiliateStats, mockWagerData, mockWagerDataRelations, transformationLogs, insertNewsletterSubscriptionSchema, selectNewsletterSubscriptionSchema, insertHistoricalRaceSchema, selectHistoricalRaceSchema, insertAffiliateStatsSchema, selectAffiliateStatsSchema, insertMockWagerDataSchema, selectMockWagerDataSchema, syncLogs, insertTransformationLogSchema, selectTransformationLogSchema, insertSyncLogSchema, selectSyncLogSchema, goatedWagerLeaderboard;
var init_schema = __esm({
  "db/schema.ts"() {
    "use strict";
    users = pgTable("users", {
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
    wagerRaceParticipants = pgTable("wager_race_participants", {
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
    syncLogs = pgTable("sync_logs", {
      id: serial("id").primaryKey(),
      type: text("type").notNull(),
      // Type of sync: 'profile', 'wager', etc.
      status: text("status").notNull(),
      // 'success', 'error', 'pending'
      error_message: text("error_message"),
      duration_ms: decimal("duration_ms", { precision: 10, scale: 2 }),
      created_at: timestamp("created_at").defaultNow().notNull()
    });
    insertTransformationLogSchema = createInsertSchema(transformationLogs);
    selectTransformationLogSchema = createSelectSchema(transformationLogs);
    insertSyncLogSchema = createInsertSchema(syncLogs);
    selectSyncLogSchema = createSelectSchema(syncLogs);
    goatedWagerLeaderboard = pgTable("goated_wager_leaderboard", {
      uid: text("uid").primaryKey(),
      name: text("name").notNull(),
      wagered_today: decimal("wagered_today", { precision: 18, scale: 8 }).notNull().default("0"),
      wagered_this_week: decimal("wagered_this_week", { precision: 18, scale: 8 }).notNull().default("0"),
      wagered_this_month: decimal("wagered_this_month", { precision: 18, scale: 8 }).notNull().default("0"),
      wagered_all_time: decimal("wagered_all_time", { precision: 18, scale: 8 }).notNull().default("0"),
      last_synced: timestamp("last_synced").defaultNow().notNull()
    });
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
      }
    });
  }
});

// server/vite.ts
import express from "express";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var __filename2, __dirname2, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    init_vite_config();
    __filename2 = fileURLToPath2(import.meta.url);
    __dirname2 = dirname2(__filename2);
    viteLogger = createLogger();
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

// server/utils/auth-utils.ts
import jwt from "jsonwebtoken";
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
var AUTH_ERROR_MESSAGES;
var init_auth_utils = __esm({
  "server/utils/auth-utils.ts"() {
    "use strict";
    AUTH_ERROR_MESSAGES = {
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
  }
});

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
    };
    goatedApiService_default = new GoatedApiService();
  }
});

// server/services/statSyncService.ts
var StatSyncService, statSyncService, statSyncService_default;
var init_statSyncService = __esm({
  "server/services/statSyncService.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_goatedApiService();
    StatSyncService = class {
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
    statSyncService = new StatSyncService();
    statSyncService_default = statSyncService;
  }
});

// server/services/profileService.ts
import { eq, sql as sql3 } from "drizzle-orm";
var ProfileService, profileService, profileService_default;
var init_profileService = __esm({
  "server/services/profileService.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_auth_utils();
    init_goatedApiService();
    init_statSyncService();
    ProfileService = class {
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
      async requestGoatedAccountLink(userId, goatedUsername) {
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
          await this.updateUser(userId, {
            goatedLinkRequested: true,
            goatedUsernameRequested: goatedUsername,
            goatedLinkRequestedAt: /* @__PURE__ */ new Date()
          });
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
            totalWager: goatedUser.wager?.all_time !== void 0 ? String(goatedUser.wager.all_time) : user.totalWager,
            verifiedBy: approvedBy,
            verifiedAt: /* @__PURE__ */ new Date()
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
            lastActive: /* @__PURE__ */ new Date()
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
                dailyWager: String(wagered.today || 0),
                weeklyWager: String(wagered.this_week || 0),
                monthlyWager: String(wagered.this_month || 0),
                lastWagerSync: /* @__PURE__ */ new Date(),
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
              lastActive: /* @__PURE__ */ new Date(),
              lastWagerSync: /* @__PURE__ */ new Date()
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
        if (isNumericId) {
          const results2 = await db.execute(sql3`
        SELECT 
          id, username, bio, email,
          profile_color as "profileColor",
          created_at as "createdAt",
          goated_id as "goatedId", 
          goated_username as "goatedUsername",
          goated_account_linked as "goatedAccountLinked"
        FROM users WHERE id::text = ${userId} LIMIT 1
      `);
          if (results2.rows && results2.rows.length > 0) {
            return results2.rows[0];
          }
        }
        const results = await db.execute(sql3`
      SELECT 
        id, username, bio, email,
        profile_color as "profileColor",
        created_at as "createdAt",
        goated_id as "goatedId", 
        goated_username as "goatedUsername",
        goated_account_linked as "goatedAccountLinked"
      FROM users WHERE goated_id = ${userId} LIMIT 1
    `);
        return results.rows && results.rows.length > 0 ? results.rows[0] : null;
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
          const email = `${userData.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@goated.placeholder.com`;
          const result = await db.execute(sql3`
        INSERT INTO users (
          username, email, password, created_at, profile_color, 
          bio, is_admin, goated_id, goated_username, goated_account_linked
        ) VALUES (
          ${userData.name}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
          'Official Goated.com player profile', false, ${userId}, ${userData.name}, true
        ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
          goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
      `);
          if (result?.rows && result.rows.length > 0) {
            console.log(`ProfileService: Created permanent profile for Goated player ${userData.name} (${userId})`);
            return {
              ...result.rows[0],
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
          const email = isNumericId ? `user_${userId}@placeholder.com` : `user_${userId.substring(0, 8)}@placeholder.com`;
          const result = await db.execute(sql3`
        INSERT INTO users (
          username, email, password, created_at, profile_color, 
          bio, is_admin, goated_id, goated_account_linked
        ) VALUES (
          ${tempUsername}, ${email}, '', ${/* @__PURE__ */ new Date()}, '#D7FF00', 
          'User profile', false, ${userId}, false
        ) RETURNING id, username, bio, profile_color as "profileColor", created_at as "createdAt", 
          goated_id as "goatedId", goated_username as "goatedUsername", goated_account_linked as "goatedAccountLinked"
      `);
          if (result?.rows && result.rows.length > 0) {
            console.log(`ProfileService: Created placeholder profile for ID ${userId}`);
            return {
              ...result.rows[0],
              isNewlyCreated: true,
              isTemporary: true
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
          const users4 = rawData?.data?.[timeframe]?.data || [];
          const foundUser = users4.find((u) => u.uid === userId);
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
        return existingUser.goatedUsername !== profile.name || existingUser.totalWager !== String(profile.wagered?.all_time || 0) || existingUser.dailyWager !== String(profile.wagered?.today || 0) || existingUser.weeklyWager !== String(profile.wagered?.this_week || 0) || existingUser.monthlyWager !== String(profile.wagered?.this_month || 0) || existingUser.dailyRank !== rankMaps.daily.get(profile.uid) || existingUser.weeklyRank !== rankMaps.weekly.get(profile.uid) || existingUser.monthlyRank !== rankMaps.monthly.get(profile.uid) || existingUser.allTimeRank !== rankMaps.allTime.get(profile.uid);
      }
      /**
       * Update existing profile
       */
      async updateExistingProfile(existingUser, profile, rankMaps) {
        await db.update(users).set({
          goatedUsername: profile.name,
          totalWager: String(profile.wagered?.all_time || 0),
          dailyWager: String(profile.wagered?.today || 0),
          weeklyWager: String(profile.wagered?.this_week || 0),
          monthlyWager: String(profile.wagered?.this_month || 0),
          dailyRank: rankMaps.daily.get(profile.uid) || null,
          weeklyRank: rankMaps.weekly.get(profile.uid) || null,
          monthlyRank: rankMaps.monthly.get(profile.uid) || null,
          allTimeRank: rankMaps.allTime.get(profile.uid) || null,
          lastActive: /* @__PURE__ */ new Date(),
          lastUpdated: /* @__PURE__ */ new Date(),
          lastWagerSync: /* @__PURE__ */ new Date()
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
          email: `${profile.uid}@goated.placeholder`,
          goatedId: profile.uid,
          goatedUsername: profile.name,
          goatedAccountLinked: true,
          totalWager: String(profile.wagered?.all_time || 0),
          dailyWager: String(profile.wagered?.today || 0),
          weeklyWager: String(profile.wagered?.this_week || 0),
          monthlyWager: String(profile.wagered?.this_month || 0),
          dailyRank: rankMaps.daily.get(profile.uid) || null,
          weeklyRank: rankMaps.weekly.get(profile.uid) || null,
          monthlyRank: rankMaps.monthly.get(profile.uid) || null,
          allTimeRank: rankMaps.allTime.get(profile.uid) || null,
          createdAt: /* @__PURE__ */ new Date(),
          lastUpdated: /* @__PURE__ */ new Date(),
          lastWagerSync: /* @__PURE__ */ new Date(),
          profileColor: "#D7FF00",
          bio: "Goated.com player"
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
    profileService = new ProfileService();
    profileService_default = profileService;
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

// server/services/wagerLeaderboardSync.ts
import { eq as eq8 } from "drizzle-orm";
async function syncGoatedWagerLeaderboard() {
  const response = await goatedApiService_default.fetchReferralData(true);
  const apiData = response.data || response;
  for (const user of apiData) {
    const dbUser = await db.select().from(goatedWagerLeaderboard).where(eq8(goatedWagerLeaderboard.uid, user.uid)).limit(1);
    if (!dbUser || dbUser.length === 0) {
      await db.insert(goatedWagerLeaderboard).values({
        uid: user.uid,
        name: user.name,
        // Only on first insert
        wagered_today: user.wagered.today,
        wagered_this_week: user.wagered.this_week,
        wagered_this_month: user.wagered.this_month,
        wagered_all_time: user.wagered.all_time,
        last_synced: /* @__PURE__ */ new Date()
      });
    } else {
      const currentUser = dbUser[0];
      const wagerChanged = currentUser.wagered_today !== user.wagered.today || currentUser.wagered_this_week !== user.wagered.this_week || currentUser.wagered_this_month !== user.wagered.this_month || currentUser.wagered_all_time !== user.wagered.all_time;
      if (wagerChanged) {
        await db.update(goatedWagerLeaderboard).set({
          wagered_today: user.wagered.today,
          wagered_this_week: user.wagered.this_week,
          wagered_this_month: user.wagered.this_month,
          wagered_all_time: user.wagered.all_time,
          last_synced: /* @__PURE__ */ new Date()
        }).where(eq8(goatedWagerLeaderboard.uid, user.uid));
      }
    }
  }
}
var SYNC_INTERVAL;
var init_wagerLeaderboardSync = __esm({
  "server/services/wagerLeaderboardSync.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_goatedApiService();
    SYNC_INTERVAL = 10 * 60 * 1e3;
    syncGoatedWagerLeaderboard().catch((error) => {
      console.error("Initial wager leaderboard sync failed:", error);
    });
    setInterval(() => {
      syncGoatedWagerLeaderboard().catch((error) => {
        console.error("Scheduled wager leaderboard sync failed:", error);
      });
    }, SYNC_INTERVAL);
  }
});

// server/tasks/dataSyncTasks.ts
var dataSyncTasks_exports = {};
__export(dataSyncTasks_exports, {
  getSyncStatus: () => getSyncStatus,
  initializeDataSyncTasks: () => initializeDataSyncTasks,
  performManualSync: () => performManualSync,
  platformApiService: () => profileService_default,
  syncUserProfiles: () => syncUserProfiles,
  syncWagerData: () => syncWagerData
});
import schedule from "node-schedule";
function initializeDataSyncTasks() {
  console.log("Initializing data synchronization tasks...");
  schedule.scheduleJob("*/10 * * * *", async () => {
    console.log("Starting scheduled user profile sync...");
    try {
      const result = await profileService_default.syncUserProfiles();
      console.log(`Scheduled profile sync completed: ${result.created} created, ${result.updated} updated, ${result.existing} unchanged`);
    } catch (error) {
      console.error("Error in scheduled profile sync:", error);
    }
  });
  schedule.scheduleJob("*/5 * * * *", async () => {
    console.log("Starting scheduled wager data sync...");
    try {
      await syncGoatedWagerLeaderboard();
      console.log("Scheduled wager sync completed");
    } catch (error) {
      console.error("Error in scheduled wager sync:", error);
    }
  });
  console.log("Data synchronization tasks initialized successfully");
}
async function performManualSync() {
  console.log("Starting manual data synchronization...");
  try {
    const profileResult = await profileService_default.syncUserProfiles();
    console.log(`Manual profile sync completed: ${profileResult.created} created, ${profileResult.updated} updated`);
    await syncGoatedWagerLeaderboard();
    console.log("Manual wager sync completed");
    return {
      success: true,
      profileSync: profileResult,
      message: "Manual synchronization completed successfully"
    };
  } catch (error) {
    console.error("Error in manual sync:", error);
    throw error;
  }
}
function getSyncStatus() {
  const jobs = schedule.scheduledJobs;
  return {
    activeJobs: Object.keys(jobs).length,
    nextProfileSync: jobs["*/10 * * * *"]?.nextInvocation()?.toISOString() || "Not scheduled",
    nextWagerSync: jobs["*/5 * * * *"]?.nextInvocation()?.toISOString() || "Not scheduled",
    uptime: process.uptime()
  };
}
async function syncUserProfiles() {
  console.warn("syncUserProfiles() in dataSyncTasks is deprecated. Use profileService.syncUserProfiles() directly.");
  return await profileService_default.syncUserProfiles();
}
async function syncWagerData() {
  console.warn("syncWagerData() in dataSyncTasks is deprecated. Use syncGoatedWagerLeaderboard() directly.");
  return await syncGoatedWagerLeaderboard();
}
var init_dataSyncTasks = __esm({
  "server/tasks/dataSyncTasks.ts"() {
    "use strict";
    init_profileService();
    init_wagerLeaderboardSync();
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
init_profileService();
import fs from "fs";
import path4 from "path";
import { fileURLToPath as fileURLToPath4 } from "url";
import { createServer as createViteServer2, createLogger as createLogger2 } from "vite";
import { promisify } from "util";
import { exec } from "child_process";
import { sql as sql8 } from "drizzle-orm";
import compression2 from "compression";

// server/routes.ts
init_db();
init_vite();
import { Router as Router6 } from "express";
import compression from "compression";
import { sql as sql7 } from "drizzle-orm";
import { createServer } from "http";
import { WebSocket as WebSocket2 } from "ws";
init_api();
import { RateLimiterMemory as RateLimiterMemory5 } from "rate-limiter-flexible";

// server/routes/bonus-challenges.ts
init_db();
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
init_vite();
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
init_db();
init_schema();
init_auth_utils();
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
init_auth_utils();
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
init_db();
init_schema();
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
init_profileService();
init_statSyncService();
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
router2.get("/leaderboard/:timeframe", async (req, res, next) => {
  try {
    const { timeframe } = req.params;
    const topPerformers = await statSyncService_default.getTopPerformers(100);
    let data;
    switch (timeframe) {
      case "daily":
        data = topPerformers.daily;
        break;
      case "weekly":
        data = topPerformers.weekly;
        break;
      case "monthly":
        data = topPerformers.monthly;
        break;
      case "all_time":
      default:
        data = topPerformers.allTime;
        break;
    }
    return res.json(data);
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
    const users4 = await userService_default.getAllUsers();
    return res.json(users4);
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
init_auth_utils();
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
    const users4 = await userService_default.getAllUsers();
    return res.status(200).json(users4);
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
init_profileService();
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
    const { goatedUsername } = req.body;
    const userId = String(req.user.id);
    const result = await profileService_default.requestGoatedAccountLink(userId, goatedUsername);
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
init_statSyncService();
import { Router as Router5 } from "express";

// server/services/raceService.ts
init_db();
init_schema();
init_cacheService();
init_statSyncService();
import { eq as eq5, sql as sql6 } from "drizzle-orm";
var fallbackRaceConfig = {
  prizePool: 500,
  prizeDistribution: {
    "1": 0.425,
    "2": 0.2,
    "3": 0.15,
    "4": 0.075,
    "5": 0.06,
    "6": 0.04,
    "7": 0.0275,
    "8": 0.0225,
    "9": 0.0175,
    "10": 0.0175
  },
  type: "monthly",
  title: "Monthly Wager Race"
};
var RaceService = class {
  /**
   * Get current wager race data
   * Used by the /api/wager-races/current endpoint
   */
  async getCurrentRace(leaderboardData) {
    const startTime = Date.now();
    console.log("RaceService: Fetching current race data");
    try {
      let dbRace = await db.query.wagerRaces.findFirst({
        where: eq5(wagerRaces.status, "live"),
        orderBy: sql6`${wagerRaces.startDate} DESC`
      });
      if (!dbRace) {
        dbRace = await db.query.wagerRaces.findFirst({
          where: eq5(wagerRaces.status, "upcoming"),
          orderBy: sql6`${wagerRaces.startDate} DESC`
        });
      }
      const config = dbRace ? {
        prizePool: Number(dbRace.prizePool),
        prizeDistribution: dbRace.prizeDistribution || fallbackRaceConfig.prizeDistribution,
        type: dbRace.type,
        title: dbRace.title || dbRace.name || fallbackRaceConfig.title,
        startDate: dbRace.startDate,
        endDate: dbRace.endDate,
        id: dbRace.id
      } : {
        ...fallbackRaceConfig,
        startDate: /* @__PURE__ */ new Date(),
        endDate: /* @__PURE__ */ new Date(),
        id: "fallback"
      };
      const raceData = this.transformToRaceData(leaderboardData, config);
      await this.saveCompletedRaceData(config.id, leaderboardData.data.monthly.data, config);
      await this.logRaceOperation(
        "current-race",
        "success",
        `Transformed current race data with ${raceData.participants.length} participants`,
        Date.now() - startTime
      );
      return raceData;
    } catch (error) {
      await this.logRaceOperation(
        "current-race",
        "error",
        `Failed to transform current race data: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Get previous wager race data
   * Used by the /api/wager-races/previous endpoint
   */
  async getPreviousRace() {
    const startTime = Date.now();
    console.log("RaceService: Fetching previous race data");
    try {
      const previousRace = await this.getLastCompletedRace();
      if (previousRace) {
        const raceData = await this.buildRaceDataFromDB(previousRace);
        await this.logRaceOperation(
          "previous-race",
          "success",
          `Retrieved previous race data from database with ${raceData.participants.length} participants`,
          Date.now() - startTime
        );
        return raceData;
      } else {
        const simulatedRaceData = await this.getSimulatedPreviousRace();
        await this.logRaceOperation(
          "previous-race",
          "success",
          `Generated simulated previous race data with ${simulatedRaceData.participants.length} participants`,
          Date.now() - startTime
        );
        return simulatedRaceData;
      }
    } catch (error) {
      await this.logRaceOperation(
        "previous-race",
        "error",
        `Failed to fetch previous race data: ${error instanceof Error ? error.message : String(error)}`,
        Date.now() - startTime,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }
  /**
   * Get user's position in the current race
   * Used by the /api/wager-race/position endpoint
   */
  async getUserRacePosition(uid, leaderboardData) {
    console.log(`RaceService: Getting race position for user ${uid}`);
    try {
      const monthlyRanked = statSyncService_default.sortByWagered(leaderboardData.data.monthly.data, "this_month");
      const userIndex = monthlyRanked.findIndex((user2) => user2.uid === uid);
      const raceConfig = this.getCurrentRaceConfig();
      if (userIndex === -1) {
        console.log(`User ${uid} not found in monthly data`);
        return {
          position: null,
          totalParticipants: monthlyRanked.length,
          wagerAmount: 0,
          previousPosition: null,
          raceType: "monthly",
          raceTitle: raceConfig.title,
          endDate: this.getCurrentRaceEndDate().toISOString()
        };
      }
      const userData = monthlyRanked[userIndex];
      let previousPosition = null;
      const user = await db.query.users.findFirst({ where: sql6`goated_id = ${uid}` });
      if (user) {
        const lastRace = await this.getLastCompletedRace();
        if (lastRace) {
          const prevParticipant = await db.query.wagerRaceParticipants.findFirst({
            where: sql6`race_id = ${lastRace.id} AND user_id = ${user.id}`
          });
          if (prevParticipant && typeof prevParticipant.previousPosition === "number") {
            previousPosition = prevParticipant.previousPosition;
          } else if (prevParticipant && typeof prevParticipant.position === "number") {
            previousPosition = prevParticipant.position;
          }
        }
      }
      return {
        position: userData.rank,
        totalParticipants: monthlyRanked.length,
        wagerAmount: userData.wagered.this_month,
        previousPosition,
        raceType: "monthly",
        raceTitle: raceConfig.title,
        endDate: this.getCurrentRaceEndDate().toISOString()
      };
    } catch (error) {
      console.error(`RaceService: Error getting race position for user ${uid}:`, error);
      throw error;
    }
  }
  /**
   * Get race by ID from database
   */
  async getRaceById(raceId) {
    try {
      const race = await db.query.wagerRaces.findFirst({
        where: eq5(wagerRaces.id, raceId)
      });
      return race || null;
    } catch (error) {
      console.error(`RaceService: Error fetching race ${raceId}:`, error);
      throw error;
    }
  }
  /**
   * Get all participants for a race
   */
  async getRaceParticipants(raceId) {
    try {
      const participants = await db.query.wagerRaceParticipants.findMany({
        where: eq5(wagerRaceParticipants.raceId, raceId)
      });
      return participants;
    } catch (error) {
      console.error(`RaceService: Error fetching participants for race ${raceId}:`, error);
      throw error;
    }
  }
  /**
   * Create a new race
   */
  async createRace(config) {
    try {
      const result = await db.insert(wagerRaces).values({
        title: config.title,
        name: config.name || `${config.type}-${Date.now()}`,
        type: config.type,
        status: "upcoming",
        prizePool: String(config.prizePool),
        startDate: config.startDate,
        endDate: config.endDate,
        prizeDistribution: config.prizeDistribution,
        description: config.description,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).returning({ id: wagerRaces.id });
      const raceId = result[0]?.id;
      if (!raceId) {
        throw new Error("Failed to create race record");
      }
      console.log(`RaceService: Created new race with ID ${raceId}`);
      return raceId;
    } catch (error) {
      console.error("RaceService: Error creating race:", error);
      throw error;
    }
  }
  /**
   * Update race status
   */
  async updateRaceStatus(raceId, status) {
    try {
      await db.update(wagerRaces).set({
        status,
        ...status === "completed" && { completedAt: /* @__PURE__ */ new Date() },
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq5(wagerRaces.id, raceId));
      console.log(`RaceService: Updated race ${raceId} status to ${status}`);
    } catch (error) {
      console.error(`RaceService: Error updating race ${raceId} status:`, error);
      throw error;
    }
  }
  // Private helper methods
  /**
   * Transforms leaderboard data into race format
   * Now takes config from DB
   */
  transformToRaceData(leaderboardData, config) {
    console.log("RaceService: Transforming leaderboard data to race format");
    const now = /* @__PURE__ */ new Date();
    const raceId = config.id?.toString() || `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}`;
    const monthlyRanked = statSyncService_default.sortByWagered(leaderboardData.data.monthly.data, "this_month");
    const totalWagered = monthlyRanked.reduce((sum, p) => sum + p.wagered.this_month, 0);
    return {
      id: raceId,
      status: "live",
      startDate: config.startDate?.toISOString?.() || now.toISOString(),
      endDate: config.endDate?.toISOString?.() || now.toISOString(),
      prizePool: config.prizePool,
      participants: monthlyRanked.map((participant) => ({
        uid: participant.uid,
        name: participant.name,
        wagered: participant.wagered.this_month,
        position: participant.rank
      })).slice(0, 10),
      totalWagered,
      participantCount: monthlyRanked.length,
      metadata: {
        transitionEnds: config.endDate ? new Date(config.endDate.getTime() + 24 * 60 * 60 * 1e3).toISOString() : "",
        nextRaceStarts: config.endDate ? new Date(config.endDate.getTime() + 24 * 60 * 60 * 1e3).toISOString() : "",
        prizeDistribution: Object.values(config.prizeDistribution)
      }
    };
  }
  /**
   * Get the last completed race from database
   */
  async getLastCompletedRace() {
    try {
      const lastRace = await db.query.wagerRaces.findFirst({
        where: eq5(wagerRaces.status, "ended"),
        orderBy: sql6`${wagerRaces.endDate} DESC`
      });
      return lastRace || null;
    } catch (error) {
      console.error("RaceService: Error fetching last completed race:", error);
      return null;
    }
  }
  /**
   * Build race data from database record
   */
  async buildRaceDataFromDB(race) {
    const participants = await this.getRaceParticipants(race.id);
    return {
      id: race.name || race.id.toString(),
      status: race.status,
      startDate: race.startDate.toISOString(),
      endDate: race.endDate.toISOString(),
      prizePool: Number(race.prizePool),
      participants: participants.sort((a, b) => a.position - b.position).map((p) => ({
        uid: p.userId?.toString() || "",
        name: p.username,
        wagered: Number(p.wagered),
        position: p.position
      })),
      totalWagered: participants.reduce((sum, p) => sum + Number(p.wagered), 0),
      participantCount: participants.length,
      metadata: {
        transitionEnds: new Date(race.endDate.getTime() + 24 * 60 * 60 * 1e3).toISOString(),
        nextRaceStarts: new Date(race.endDate.getTime() + 24 * 60 * 60 * 1e3).toISOString(),
        prizeDistribution: Object.values(race.prizeDistribution)
      }
    };
  }
  /**
   * Generate simulated previous race data (fallback)
   */
  async getSimulatedPreviousRace() {
    const previousMonth = new Date(2025, 2, 1);
    const endOfPreviousMonth = new Date(2025, 3, 0);
    const raceId = `${previousMonth.getFullYear()}${(previousMonth.getMonth() + 1).toString().padStart(2, "0")}`;
    const simulatedParticipants = [
      { uid: "sim1", name: "Player1", wagered: 15e3, position: 1 },
      { uid: "sim2", name: "Player2", wagered: 12e3, position: 2 },
      { uid: "sim3", name: "Player3", wagered: 8e3, position: 3 },
      { uid: "sim4", name: "Player4", wagered: 6e3, position: 4 },
      { uid: "sim5", name: "Player5", wagered: 4e3, position: 5 }
    ];
    const totalWagered = simulatedParticipants.reduce((sum, p) => sum + p.wagered, 0);
    const raceConfig = this.getCurrentRaceConfig();
    return {
      id: raceId,
      status: "ended",
      startDate: previousMonth.toISOString(),
      endDate: endOfPreviousMonth.toISOString(),
      prizePool: raceConfig.prizePool,
      participants: simulatedParticipants,
      totalWagered,
      participantCount: simulatedParticipants.length,
      metadata: {
        transitionEnds: new Date(2025, 3, 2).toISOString(),
        // April 2, 2025
        nextRaceStarts: new Date(2025, 3, 1).toISOString(),
        // April 1, 2025
        prizeDistribution: Object.values(raceConfig.prizeDistribution)
      }
    };
  }
  /**
   * Save completed race data to the database
   * Now logs full config into metadata
   */
  async saveCompletedRaceData(raceId, monthlyData, config) {
    try {
      console.log(`RaceService: Saving completed race data for race ${raceId}`);
      const existingRace = await db.query.wagerRaces.findFirst({
        where: sql6`id = ${raceId} OR name = ${raceId}`
      });
      if (existingRace) {
        if (existingRace.status !== "ended") {
          await this.updateRaceStatus(existingRace.id, "completed");
        }
        await this.updateRaceParticipants(existingRace.id, monthlyData, config);
      } else {
        await this.createCompletedRace(raceId, monthlyData, config);
      }
      cacheService.invalidate("current_race");
      cacheService.invalidate("previous_race");
      cacheService.invalidate("leaderboard_top_performers");
    } catch (error) {
      console.error(`RaceService: Error saving completed race data for race ${raceId}:`, error);
    }
  }
  /**
   * Update participants for an existing race
   * Now uses config from DB
   */
  async updateRaceParticipants(raceId, monthlyData, config) {
    const existingParticipants = await this.getRaceParticipants(raceId);
    const race = await this.getRaceById(raceId);
    if (!race) return;
    const ranked = statSyncService_default.sortByWagered(monthlyData, "this_month");
    const prevSnapshot = {};
    for (const p of existingParticipants) {
      if (p.userId) prevSnapshot[p.userId.toString()] = p.position;
    }
    const top10 = ranked.slice(0, 10);
    for (const participant of top10) {
      const user = await db.query.users.findFirst({
        where: sql6`goated_id = ${participant.uid}`
      });
      const existingParticipant = existingParticipants.find(
        (p) => user ? p.userId === user.id : p.username === participant.name
      );
      const prizeAmount = this.calculatePrizeAmount(
        participant.rank,
        Number(config.prizePool),
        config.prizeDistribution
      );
      const previousPosition = user && prevSnapshot[user.id?.toString()] ? prevSnapshot[user.id.toString()] : null;
      if (existingParticipant) {
        await db.update(wagerRaceParticipants).set({
          position: participant.rank,
          previousPosition,
          wagered: String(participant.wagered),
          prizeAmount: String(prizeAmount),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq5(wagerRaceParticipants.id, existingParticipant.id));
      } else {
        await db.insert(wagerRaceParticipants).values({
          raceId,
          userId: user?.id,
          username: participant.name,
          wagered: String(participant.wagered),
          position: participant.rank,
          previousPosition,
          prizeAmount: String(prizeAmount),
          joinedAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
      }
      console.log(`RaceService: Updated/added participant ${participant.name} for race ${raceId}`);
    }
    cacheService.invalidate("current_race");
    cacheService.invalidate("previous_race");
    cacheService.invalidate("leaderboard_top_performers");
  }
  /**
   * Create a new completed race with participants
   * Now uses config from DB
   */
  async createCompletedRace(raceId, monthlyData, config) {
    const result = await db.insert(wagerRaces).values({
      title: config.title,
      name: raceId,
      type: config.type,
      status: "ended",
      prizePool: String(config.prizePool),
      startDate: config.startDate,
      endDate: config.endDate,
      prizeDistribution: config.prizeDistribution,
      completedAt: /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning({ id: wagerRaces.id });
    const newRaceId = result[0]?.id;
    if (newRaceId) {
      console.log(`RaceService: Created new race record with ID ${newRaceId}`);
      await this.updateRaceParticipants(newRaceId, monthlyData, config);
    } else {
      console.error(`RaceService: Failed to create race record for ${raceId}`);
    }
  }
  /**
   * Calculate prize amount for a given position
   * Now always uses config from DB
   */
  calculatePrizeAmount(position, prizePool, prizeDistribution) {
    const percentage = prizeDistribution[position.toString()] || 0;
    return prizePool * percentage;
  }
  /**
   * Get current race configuration
   * TODO: Move to database configuration instead of hardcoded values
   */
  getCurrentRaceConfig() {
    return {
      prizePool: 500,
      prizeDistribution: {
        "1": 0.425,
        "2": 0.2,
        "3": 0.15,
        "4": 0.075,
        "5": 0.06,
        "6": 0.04,
        "7": 0.0275,
        "8": 0.0225,
        "9": 0.0175,
        "10": 0.0175
      },
      type: "monthly",
      title: "Monthly Wager Race"
    };
  }
  /**
   * Get current race end date
   * TODO: Make this dynamic based on race configuration
   */
  getCurrentRaceEndDate() {
    const now = /* @__PURE__ */ new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }
  /**
   * Log race-related operations
   */
  async logRaceOperation(type, status, message, durationMs, errorMessage) {
    try {
      await db.insert(transformationLogs).values({
        type: status,
        message: `[race-${type}] ${message}`,
        duration_ms: String(durationMs),
        created_at: /* @__PURE__ */ new Date(),
        resolved: status !== "error",
        error_message: errorMessage
      });
    } catch (error) {
      console.error("RaceService: Failed to log operation:", error);
    }
  }
};
var raceService = new RaceService();
var raceService_default = raceService;

// server/routes/apiRoutes.ts
init_profileService();
var router5 = Router5();
router5.get("/affiliate/stats", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "stats_aggregate",
      () => statSyncService_default.getAggregatedStats(),
      30
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});
router5.get("/wager-races/current", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "current_race",
      () => raceService_default.getCurrentRace(),
      30
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});
router5.get("/wager-races/previous", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "previous_race",
      () => raceService_default.getPreviousRace(),
      30
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});
router5.get("/wager-race/position", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid || typeof uid !== "string") {
      return res.status(400).json({ error: "User ID (uid) is required" });
    }
    console.log(`Fetching race position for user ${uid}`);
    const leaderboardData = await statSyncService_default.getLeaderboardData();
    const positionData = await raceService_default.getUserRacePosition(uid, leaderboardData);
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
router5.get("/leaderboard/top", async (req, res, next) => {
  try {
    const data = await cacheService.getOrSet(
      "leaderboard_top_performers",
      () => statSyncService_default.getTopPerformers(10),
      60
      // seconds TTL
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});
var apiRoutes_default = router5;

// server/routes.ts
init_schema();
init_statSyncService();
init_cacheService();
import { eq as eq6 } from "drizzle-orm";
import { z as z4 } from "zod";
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
          orderBy: (logs2, { desc: desc2 }) => [desc2(logs2.created_at)],
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
var wheelSpinSchema = z4.object({
  segmentIndex: z4.number(),
  reward: z4.string().nullable()
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

// server/index.ts
init_db();

// server/auth.ts
init_schema();
init_db();
init_auth_utils();
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
              const users4 = leaderboardData?.data?.[timeframe]?.data || [];
              const foundUser = users4.find((user) => user.uid === userId);
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
async function syncUserProfiles2() {
  try {
    console.log("Running scheduled profile sync...");
    const result = await profileService_default.syncUserProfiles();
    console.log(`Profile sync completed. Created ${result.created} new profiles, updated ${result.updated}, ${result.existing} unchanged (total: ${result.totalProcessed}).`);
  } catch (error) {
    console.error("Error in scheduled profile sync:", error);
  }
}
async function initializeServer() {
  try {
    log("info", "Starting server initialization...");
    await waitForPort(PORT2);
    log("info", "Port available, proceeding with initialization");
    await testDbConnection();
    log("info", "Database connection established");
    const { initializeDataSyncTasks: initializeDataSyncTasks2 } = await Promise.resolve().then(() => (init_dataSyncTasks(), dataSyncTasks_exports));
    initializeDataSyncTasks2();
    log("info", "Starting background data sync...");
    syncUserProfiles2().catch((error) => {
      log("error", `Background profile sync failed: ${error instanceof Error ? error.message : String(error)}`);
    });
    Promise.resolve().then(() => (init_goatedApiService(), goatedApiService_exports)).then(({ default: goatedApiService }) => {
      return goatedApiService.updateAllWagerData();
    }).then((wagerCount) => {
      log("info", `Background wager data update completed for ${wagerCount} users`);
    }).catch((error) => {
      log("error", `Background wager sync failed: ${error instanceof Error ? error.message : String(error)}`);
    });
    log("info", "Data synchronization tasks initialized");
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
