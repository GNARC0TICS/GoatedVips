/**
 * Data Synchronization Tasks
 * 
 * This module schedules and manages regular data synchronization with the Goated.com API.
 * It ensures the platform stays up-to-date with the latest data from the external system.
 */

import * as cron from 'node-cron';
import goatedApiService from '../services/goatedApiService';
import { platformApiService } from '../services/platformApiService';

// Create a flag to track if initialization has been done
let initialized = false;

// Schedule times (using server timezone)
const SCHEDULE_CONFIG = {
  // Every hour at minute 5
  HOURLY: '5 * * * *',
  
  // Every 15 minutes
  FREQUENT: '*/15 * * * *',
  
  // Twice per day (at 00:05 and 12:05)
  DAILY: '5 0,12 * * *',
  
  // Once per week on Sunday at 00:15
  WEEKLY: '15 0 * * 0',
};

/**
 * Initializes scheduled data synchronization tasks
 * This function sets up cron jobs that automatically run sync operations
 */
export function initializeDataSyncTasks() {
  // Prevent duplicate initialization
  if (initialized) {
    console.log('Data sync tasks already initialized');
    return;
  }
  
  console.log('Initializing data sync tasks');
  
  // Schedule user profile synchronization every hour
  // This includes all user data from the API
  cron.schedule(SCHEDULE_CONFIG.HOURLY, async () => {
    try {
      console.log('Running scheduled user profile sync');
      const result = await platformApiService.syncUserProfiles();
      console.log(`Profile sync completed: ${result.created} created, ${result.updated} updated, ${result.existing} unchanged`);
    } catch (error) {
      console.error('Scheduled user profile sync failed:', error);
    }
  });
  
  // Set the initialization flag
  initialized = true;
  console.log('Data sync tasks successfully initialized');
}

// Export other utility functions as needed
export async function syncAllData() {
  // This function can be called manually to force a sync
  try {
    console.log('Manual sync triggered for all data');
    
    // Run the profile sync first
    const profileResult = await platformApiService.syncUserProfiles();
    
    console.log(`All data synchronized successfully: ${profileResult.created + profileResult.updated} profiles updated`);
    return { profiles: profileResult };
  } catch (error) {
    console.error('Manual full data sync failed:', error);
    throw error;
  }
}