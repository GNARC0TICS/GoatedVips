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
import { sql } from "drizzle-orm";
import compression from "compression";

// Application modules
import { log } from "./utils/logger";
import { registerRoutes } from "./routes";
import { domainRedirectMiddleware } from "./middleware/domain-handler";
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
const { PORT, HOST, IS_DEVELOPMENT, IS_PRODUCTION, CORS_ORIGINS, SESSION_SECRET, COOKIE_SECURE, COOKIE_MAX_AGE, API_TOKEN, DATABASE_URL } = ENV;

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
      // Try to find by direct ID match first
      const results = await db.execute(sql`
        SELECT id, username, goated_id as "goatedId", goated_username as "goatedUsername"
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
        SELECT id, username, goated_id as "goatedId", goated_username as "goatedUsername"
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
      const token = API_TOKEN || API_CONFIG.token;
      
      // Try to fetch user data from the leaderboard API
      let userData = null;
      
      if (token) {
        try {
          // Fetch leaderboard data which contains all users
          const leaderboardUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`;
          console.log(`Fetching leaderboard data to find user ${userId}`);
          
          const response = await fetch(leaderboardUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            }
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
          
          // Extract wager data from the user data
          const totalWager = userData.wagered?.all_time || 0;
          const wagerToday = userData.wagered?.today || 0;
          const wagerWeek = userData.wagered?.this_week || 0;
          const wagerMonth = userData.wagered?.this_month || 0;
          
          // Log the data for debugging
          console.log(`Creating profile with wager data:`, {
            total: totalWager,
            today: wagerToday,
            week: wagerWeek,
            month: wagerMonth
          });
          
          // Create a complete profile with both new schema fields and legacy fields
          const result = await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, 
              -- New schema fields
              uid, total_wager, wager_today, wager_week, wager_month, verified,
              -- Legacy fields for backward compatibility
              goated_id, goated_username, goated_account_linked
            ) VALUES (
              ${newUserId}, ${username}, ${email}, '', ${new Date()}, '#D7FF00', 
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
        // No user data found in leaderboard, create a temporary placeholder profile
        try {
          const newUserId = Math.floor(1000 + Math.random() * 9000);
          // Use 'Goated User' instead of 'Player_' to match the site's branding
          const tempUsername = `Goated User ${userId}`;
          const email = `user_${userId}@goated.placeholder.com`;
          
          // Create a placeholder profile with clear indication this is temporary
          // Include both new schema fields and legacy fields
          const result = await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, 
              -- New schema fields
              uid, total_wager, wager_today, wager_week, wager_month, verified,
              -- Legacy fields
              goated_id, goated_account_linked
            ) VALUES (
              ${newUserId}, ${tempUsername}, ${email}, '', ${new Date()}, '#D7FF00', 
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
      // Handle non-numeric IDs (like UUIDs or custom strings)
      try {
        const shortId = userId.substring(0, 8); // Use first 8 chars of UUID/string
        const newUserId = Math.floor(1000 + Math.random() * 9000);
        const username = `Goated Custom ${shortId}`;
        const email = `custom_${shortId}@goated.placeholder.com`;
        
        // Clear indication this is a non-Goated profile
        // Include both new schema and legacy fields
        const result = await db.execute(sql`
          INSERT INTO users (
            id, username, email, password, created_at, profile_color, 
            bio, is_admin, 
            -- New schema fields
            uid, total_wager, wager_today, wager_week, wager_month, verified,
            -- Legacy fields
            goated_id, goated_account_linked
          ) VALUES (
            ${newUserId}, ${username}, ${email}, '', ${new Date()}, '#D7FF00', 
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

/**
 * Creates user profiles for all external API users
 * Ensures profiles exist for everyone in the leaderboard
 * Optimized to avoid unnecessary processing and track API response changes 
 */
async function syncUserProfiles() {
  try {
    console.log("Starting optimized user profile sync...");
    
    const token = API_TOKEN || API_CONFIG.token;
    if (!token) {
      console.warn("API token not configured, skipping profile sync");
      return;
    }
    
    const startTime = Date.now();
    const endpointKey = API_CONFIG.endpoints.leaderboard;
    const url = `${API_CONFIG.baseUrl}${endpointKey}`;
    
    // Check if we have previously synced metadata for this endpoint
    const syncMetadata = await db.execute(sql`
      SELECT * FROM api_sync_metadata 
      WHERE endpoint = ${endpointKey} 
      ORDER BY last_sync_time DESC 
      LIMIT 1
    `);
    
    const lastSync = syncMetadata.rows && syncMetadata.rows.length > 0 
      ? syncMetadata.rows[0] 
      : null;
    
    // Make initial request with HEAD to check ETag and Last-Modified
    let headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    
    // Add conditional headers if we have previous metadata
    if (lastSync) {
      if (lastSync.etag) {
        headers["If-None-Match"] = lastSync.etag;
      }
      if (lastSync.last_modified) {
        headers["If-Modified-Since"] = lastSync.last_modified;
      }
    }
    
    console.log(`Fetching leaderboard data from: ${url}`);
    
    // Make the actual API request
    const response = await fetch(url, { headers });
    
    // Handle 304 Not Modified case
    if (response.status === 304) {
      console.log("API data unchanged since last sync (304 Not Modified)");
      
      // Update the sync time but keep other metadata the same
      await db.execute(sql`
        INSERT INTO api_sync_metadata (
          endpoint, last_sync_time, record_count, etag, last_modified,
          response_hash, is_full_sync, sync_duration_ms, metadata
        ) VALUES (
          ${endpointKey}, ${new Date()}, ${lastSync.record_count}, 
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
    
    // Store response headers for future conditional requests
    const responseEtag = response.headers.get("etag");
    const responseLastModified = response.headers.get("last-modified");
    
    const rawData = await response.json();
    
    // Generate a simple hash of the response data for comparison
    const responseJSON = JSON.stringify(rawData);
    const responseHash = await generateSimpleHash(responseJSON);
    
    // If we have a previous sync and the hash matches, skip full processing
    if (lastSync && lastSync.response_hash === responseHash) {
      console.log("API data unchanged since last sync (hash match)");
      
      // Update the sync time but keep other metadata the same
      await db.execute(sql`
        INSERT INTO api_sync_metadata (
          endpoint, last_sync_time, record_count, etag, last_modified,
          response_hash, is_full_sync, sync_duration_ms, metadata
        ) VALUES (
          ${endpointKey}, ${new Date()}, ${lastSync.record_count}, 
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
    
    // Handle different response formats to normalize the data structure
    let leaderboardData;
    if (rawData.data && rawData.data.all_time) {
      // Standard format with nested timeframes
      leaderboardData = rawData;
      console.log("Using standard nested format with all_time data");
    } else if (Array.isArray(rawData)) {
      // Direct array of users
      leaderboardData = {
        data: {
          all_time: {
            data: rawData
          }
        }
      };
      console.log("Using direct array format");
    } else if (rawData.results && Array.isArray(rawData.results)) {
      // Results array format
      leaderboardData = {
        data: {
          all_time: {
            data: rawData.results
          }
        }
      };
      console.log("Using results array format");
    } else if (typeof rawData === 'object' && rawData !== null) {
      // Try to extract any array we can find
      const possibleArrays = Object.values(rawData).filter(value => Array.isArray(value));
      if (possibleArrays.length > 0) {
        const longestArray = possibleArrays.reduce((a: any, b: any) => a.length > b.length ? a : b);
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
    
    // Process all_time data to get unique users
    const allTimeData = leaderboardData?.data?.all_time?.data || [];
    let createdCount = 0;
    let existingCount = 0;
    let updatedCount = 0;
    
    // Count users in the current database for comparison
    const userCountResult = await db.execute(sql`SELECT COUNT(*) FROM users WHERE goated_id IS NOT NULL`);
    const currentUserCount = parseInt(userCountResult.rows[0].count, 10) || 0;
    
    console.log(`Current user count in database: ${currentUserCount}`);
    console.log(`Users in API response: ${allTimeData.length}`);
    
    // Optimization: Skip full processing if user count hasn't changed significantly
    // and we've done a full sync before
    if (lastSync && lastSync.is_full_sync && 
        Math.abs(currentUserCount - allTimeData.length) < 10 && 
        allTimeData.length > 0) {
      
      // Just update a small sample of users to keep data fresh
      // Get random users (10% or at least 10, but not more than 50)
      const sampleSize = Math.min(50, Math.max(10, Math.floor(allTimeData.length * 0.1)));
      const sampleUsers = allTimeData
        .sort(() => 0.5 - Math.random())  // Shuffle array
        .slice(0, sampleSize);  // Take a sample
      
      console.log(`Performing partial sync with ${sampleUsers.length} sample users`);
      
      for (const player of sampleUsers) {
        try {
          // Skip entries without uid or name
          if (!player.uid || !player.name) continue;
          
          // Extract wager data from the player object
          const totalWager = player.wagered?.all_time || 0;
          const wagerToday = player.wagered?.today || 0;
          const wagerWeek = player.wagered?.this_week || 0;
          const wagerMonth = player.wagered?.this_month || 0;
          
          // Check if user exists and update
          const existingUser = await db.select().from(users)
            .where(sql`goated_id = ${player.uid}`)
            .limit(1);
          
          if (existingUser && existingUser.length > 0) {
            // Update existing user with latest wager data
            await db.execute(sql`
              UPDATE users 
              SET 
                goated_username = ${player.name},
                total_wager = ${totalWager},
                wager_today = ${wagerToday},
                wager_week = ${wagerWeek},
                wager_month = ${wagerMonth}
              WHERE goated_id = ${player.uid}
            `);
            updatedCount++;
          }
        } catch (error) {
          console.error(`Error updating sample user ${player?.name}:`, error);
        }
      }
      
      // Record this partial sync
      await db.execute(sql`
        INSERT INTO api_sync_metadata (
          endpoint, last_sync_time, record_count, etag, last_modified,
          response_hash, is_full_sync, sync_duration_ms, metadata
        ) VALUES (
          ${endpointKey}, ${new Date()}, ${allTimeData.length}, 
          ${responseEtag}, ${responseLastModified}, ${responseHash},
          false, ${Date.now() - startTime}, ${{
            partialSync: true,
            sampleSize,
            updatedCount,
            userCountDifference: allTimeData.length - currentUserCount
          }}
        )
      `);
      
      console.log(`Partial sync completed. ${updatedCount} profiles updated of ${sampleSize} sampled.`);
      return;
    }
    
    // Perform full sync when:
    // 1. We've never synced before
    // 2. Number of users has changed significantly 
    // 3. Response content has changed based on hash
    console.log(`Performing full sync with ${allTimeData.length} users from leaderboard`);
    
    // Process each user from the leaderboard
    for (const player of allTimeData) {
      try {
        // Skip entries without uid or name
        if (!player.uid || !player.name) continue;
        
        // Extract wager data from the player object
        const totalWager = player.wagered?.all_time || 0;
        const wagerToday = player.wagered?.today || 0;
        const wagerWeek = player.wagered?.this_week || 0;
        const wagerMonth = player.wagered?.this_month || 0;
        
        // Check if user already exists by uid or goatedId (for backward compatibility)
        const existingUser = await db.select().from(users)
          .where(sql`goated_id = ${player.uid}`)
          .limit(1);
        
        if (existingUser && existingUser.length > 0) {
          // Update existing user with latest wager data and set new schema fields
          await db.execute(sql`
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
              verified = true
            WHERE goated_id = ${player.uid}
          `);
          updatedCount++;
          existingCount++;
          continue; // Skip to the next user
        }
        
        // Create a new permanent profile for this Goated user
        // Use the Goated UID to create a deterministic numeric ID
        // This ensures we always get the same ID for the same user
        const uidHash = player.uid.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const newUserId = 10000 + (uidHash % 90000); // Ensures ID is in range 10000-99999
        const email = `${player.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@goated.placeholder.com`;
        
        try {
          await db.execute(sql`
            INSERT INTO users (
              id, username, email, password, created_at, profile_color, 
              bio, is_admin, 
              -- Legacy fields
              goated_id, goated_username, goated_account_linked,
              -- New schema fields
              uid, total_wager, wager_today, wager_week, wager_month, verified
            ) VALUES (
              ${newUserId}, ${player.name}, ${email}, '', ${new Date()}, '#D7FF00', 
              'Official Goated.com player profile', false, 
              -- Legacy fields values
              ${player.uid}, ${player.name}, true,
              -- New schema fields values
              ${player.uid}, ${totalWager}, ${wagerToday}, ${wagerWeek}, ${wagerMonth}, true
            )
          `);
          console.log(`Created new user profile for ${player.name} (UID: ${player.uid})`);
          createdCount++;
        } catch (error: any) {
          // If the error is a duplicate ID, try again with a different ID
          if (error.code === '23505' && error.constraint === 'users_pkey') {
            // Add some randomness to avoid collisions
            const altId = 100000 + Math.floor(Math.random() * 900000);
            try {
              await db.execute(sql`
                INSERT INTO users (
                  id, username, email, password, created_at, profile_color, 
                  bio, is_admin, 
                  -- Legacy fields
                  goated_id, goated_username, goated_account_linked,
                  -- New schema fields
                  uid, total_wager, wager_today, wager_week, wager_month, verified
                ) VALUES (
                  ${altId}, ${player.name}, ${email}, '', ${new Date()}, '#D7FF00', 
                  'Official Goated.com player profile', false, 
                  -- Legacy fields values
                  ${player.uid}, ${player.name}, true,
                  -- New schema fields values
                  ${player.uid}, ${totalWager}, ${wagerToday}, ${wagerWeek}, ${wagerMonth}, true
                )
              `);
              console.log(`Created new user profile with alt ID for ${player.name} (UID: ${player.uid})`);
              createdCount++;
            } catch (innerError) {
              console.error(`Failed to create user with alternative ID for ${player.name}:`, innerError);
            }
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error(`Error creating/updating profile for ${player?.name}:`, error);
      }
    }
    
    // Record this full sync
    const syncDuration = Date.now() - startTime;
    await db.execute(sql`
      INSERT INTO api_sync_metadata (
        endpoint, last_sync_time, record_count, etag, last_modified,
        response_hash, is_full_sync, sync_duration_ms, metadata
      ) VALUES (
        ${endpointKey}, ${new Date()}, ${allTimeData.length}, 
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

/**
 * Generate a simple hash for a string
 * Used to quickly compare API responses without storing the full content
 */
async function generateSimpleHash(str: string): Promise<string> {
  // Use a simpler approach for browsers that might not support crypto
  if (str.length === 0) return "empty";
  
  // Take the first 100 chars, middle 100 chars, and last a 100 chars for a rough comparison
  // plus the length which is a good indicator of changes
  const len = str.length;
  const start = str.substring(0, Math.min(100, len));
  const middle = len > 200 ? 
    str.substring(Math.floor(len/2) - 50, Math.floor(len/2) + 50) : 
    "";
  const end = len > 100 ? str.substring(len - 100) : "";
  
  // Combine parts with length for a simple fingerprint
  return `len:${len}|start:${start}|mid:${middle}|end:${end}`;
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
    
    // Synchronize user profiles from API
    await syncUserProfiles();
    log("info", "User profiles synchronized");

    const app = express();
    setupMiddleware(app);
    setupAuth(app);
    registerRoutes(app);

    // Admin routes are set up through the middleware and routes system
    log("info", "Admin routes initialized");

    server = createServer(app);
    setupWebSocket(server);


    // Setup development or production server based on environment
    if (IS_DEVELOPMENT) {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Global error handler
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error("Server error:", err);
      res.status(500).json({
        error: IS_PRODUCTION ? 'Internal Server Error' : err.message
      });
    });

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

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
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

// Initialize server
initializeServer().catch((error) => {
  log("error", `Server startup error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});