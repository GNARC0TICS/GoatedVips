/**
 * Data Synchronization Tasks
 * 
 * This file manages all scheduled tasks for data synchronization between our platform
 * and the external Goated.com API. It handles scheduling, execution, and logging of sync events.
 */

import { platformApiService } from '../services/platformApiService';
import goatedApiService from '../services/goatedApiService';
import { scheduleJob } from 'node-schedule';
import { db } from 'db';
import { syncLogs } from '@db/schema';

// Set up sync schedules
const SYNC_SCHEDULES = {
  // Run profile sync hourly at minute 15 (1:15, 2:15, etc.)
  PROFILE_SYNC: '15 * * * *',
  
  // Run wager data updates every 30 minutes
  WAGER_DATA: '*/30 * * * *',
  
  // Refresh API cache every 15 minutes
  API_REFRESH: '*/15 * * * *'
};

/**
 * Initialize all data synchronization tasks
 * This is called at server startup to schedule recurring tasks
 */
export function initializeDataSyncTasks() {
  try {
    console.log("[Initializing data sync tasks]", "info");
    
    // Schedule profile synchronization
    scheduleJob(SYNC_SCHEDULES.PROFILE_SYNC, () => {
      console.log("[Running scheduled profile sync...]");
      runProfileSync().catch(err => {
        console.error("[Profile sync error]", err);
        logSyncError('profile', err);
      });
    });
    
    // Schedule wager data updates
    scheduleJob(SYNC_SCHEDULES.WAGER_DATA, () => {
      console.log("[Running scheduled wager data update...]");
      runWagerDataUpdate().catch(err => {
        console.error("[Wager data update error]", err);
        logSyncError('wager', err);
      });
    });
    
    // Schedule API cache refresh
    scheduleJob(SYNC_SCHEDULES.API_REFRESH, () => {
      console.log("[Refreshing API cache...]");
      refreshApiCache().catch(err => {
        console.error("[API cache refresh error]", err);
        logSyncError('api-cache', err);
      });
    });
    
    console.log("[Data sync tasks successfully initialized]", "info");
  } catch (error) {
    console.error("[Failed to initialize data sync tasks]", error);
  }
}

/**
 * Run profile synchronization process
 * Syncs user profiles from external API to our database
 */
export async function runProfileSync() {
  console.log("Running scheduled profile sync...");
  const startTime = Date.now();
  
  try {
    // Perform the actual synchronization
    const result = await platformApiService.syncUserProfiles();
    
    // Log successful sync
    await db.insert(syncLogs).values({
      type: 'profile',
      status: 'success',
      created_count: result.created,
      updated_count: result.updated,
      total_processed: result.totalProcessed,
      duration_ms: result.duration,
      created_at: new Date()
    });
    
    console.log(`[Profile sync completed] Created: ${result.created}, Updated: ${result.updated}, Unchanged: ${result.existing} (Total: ${result.totalProcessed}), Duration: ${result.duration}ms`);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Profile sync failed]", errorMessage);
    
    // Log sync failure
    await logSyncError('profile', error);
    throw error;
  }
}

/**
 * Run wager data update process
 * Updates wager statistics for all users
 */
export async function runWagerDataUpdate() {
  console.log("Running scheduled wager data update...");
  const startTime = Date.now();
  
  try {
    // Perform the actual update
    const updatedCount = await platformApiService.updateWagerData();
    
    // Log successful update
    await db.insert(syncLogs).values({
      type: 'wager',
      status: 'success',
      updated_count: updatedCount,
      total_processed: updatedCount,
      duration_ms: Date.now() - startTime,
      created_at: new Date()
    });
    
    console.log(`[Wager data update completed] Updated: ${updatedCount}, Duration: ${Date.now() - startTime}ms`);
    return updatedCount;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Wager data update failed]", errorMessage);
    
    // Log update failure
    await logSyncError('wager', error);
    throw error;
  }
}

/**
 * Refresh API cache
 * Makes a fresh API request to update the cached data
 */
export async function refreshApiCache() {
  console.log("Refreshing API cache...");
  const startTime = Date.now();
  
  try {
    // Force a fresh API request to update the cache
    await goatedApiService.fetchReferralData(true);
    
    // Log successful cache refresh
    await db.insert(syncLogs).values({
      type: 'api-cache',
      status: 'success',
      duration_ms: Date.now() - startTime,
      created_at: new Date()
    });
    
    console.log(`[API cache refresh completed] Duration: ${Date.now() - startTime}ms`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[API cache refresh failed]", errorMessage);
    
    // Log cache refresh failure
    await logSyncError('api-cache', error);
    throw error;
  }
}

/**
 * Log a sync error to the database
 * Used for tracking and monitoring sync failures
 * 
 * @param type Type of sync operation
 * @param error Error object or string
 */
async function logSyncError(type: string, error: unknown) {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await db.insert(syncLogs).values({
      type,
      status: 'error',
      error_message: errorMessage,
      duration_ms: 0, // We don't know the duration for failed syncs
      created_at: new Date()
    });
  } catch (dbError) {
    // Just log to console if we can't write to the database
    console.error(`[Failed to log ${type} sync error to database]`, dbError);
  }
}

// For compatibility with the sync functions in platformApiService
export const syncUserProfiles = runProfileSync;
export const updateWagerData = runWagerDataUpdate;