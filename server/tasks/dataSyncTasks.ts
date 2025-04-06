
/**
 * Data Synchronization Tasks
 * 
 * This module handles scheduled tasks for synchronizing data from the external API
 * to our local database. It uses node-cron to schedule regular updates.
 */

import cron from 'node-cron';
import goatedApiService from '../services/goatedApiService';
import { log } from '../utils/logger';

// Schedule for syncing user profiles (once per hour)
export function scheduleUserProfileSync() {
  cron.schedule('0 * * * *', async () => {
    try {
      log('info', 'Running scheduled user profile sync');
      
      const result = await goatedApiService.syncUserProfiles();
      
      log('info', `Profile sync completed: Created ${result.created}, Updated ${result.updated}, Already existed ${result.existing}`);
    } catch (error) {
      log('error', `Error in scheduled user profile sync: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  log('info', 'User profile sync scheduled (hourly)');
}

// Schedule for updating wager data (every 15 minutes)
export function scheduleWagerDataUpdate() {
  cron.schedule('*/15 * * * *', async () => {
    try {
      log('info', 'Running scheduled wager data update');
      
      const updatedCount = await goatedApiService.updateAllWagerData();
      
      log('info', `Wager data update completed: Updated ${updatedCount} users`);
    } catch (error) {
      log('error', `Error in scheduled wager data update: ${error instanceof Error ? error.message : String(error)}`);
    }
  });
  
  log('info', 'Wager data update scheduled (every 15 minutes)');
}

// Initialize all data sync tasks
export function initializeDataSyncTasks() {
  scheduleUserProfileSync();
  scheduleWagerDataUpdate();
  
  // Run an initial sync on startup with increased delay and better error handling
  setTimeout(async () => {
    try {
      log('info', 'Running initial data sync on startup');
      const result = await goatedApiService.syncUserProfiles();
      log('info', `Initial sync completed: Created ${result.created}, Updated ${result.updated}, Already existed ${result.existing}`);
    } catch (error) {
      log('error', `Error in initial data sync: ${error instanceof Error ? error.message : String(error)}`);
      // Log the full error for debugging
      console.error('Full error details:', error);
    }
  }, 10000); // Wait 10 seconds after server start to ensure all systems are ready
  
  log('info', 'Data sync tasks initialized');
}
