/**
 * Data Synchronization Tasks
 * 
 * This file handles all scheduled data synchronization tasks for the platform.
 * It manages the timing and execution of profile syncing and wager data updates.
 */

import schedule from 'node-schedule';
import profileService from '../services/profileService';
import { syncGoatedWagerLeaderboard } from '../services/wagerLeaderboardSync';

/**
 * Initialize all data synchronization tasks
 * Sets up scheduled jobs for profile syncing and data updates
 */
export function initializeDataSyncTasks() {
  console.log('Initializing data synchronization tasks...');

  // Schedule user profile sync every 10 minutes
  schedule.scheduleJob('*/10 * * * *', async () => {
    console.log('Starting scheduled user profile sync...');
    try {
      const result = await profileService.syncUserProfiles();
      console.log(`Scheduled profile sync completed: ${result.created} created, ${result.updated} updated, ${result.existing} unchanged`);
    } catch (error) {
      console.error('Error in scheduled profile sync:', error);
    }
  });

  // Schedule wager data sync every 5 minutes
  schedule.scheduleJob('*/5 * * * *', async () => {
    console.log('Starting scheduled wager data sync...');
    try {
      await syncGoatedWagerLeaderboard();
      console.log('Scheduled wager sync completed');
    } catch (error) {
      console.error('Error in scheduled wager sync:', error);
    }
  });

  console.log('Data synchronization tasks initialized successfully');
}

/**
 * Manual sync function for admin triggers
 * Can be called by admin endpoints to force immediate synchronization
 */
export async function performManualSync() {
  console.log('Starting manual data synchronization...');
  
  try {
    // Sync user profiles
    const profileResult = await profileService.syncUserProfiles();
    console.log(`Manual profile sync completed: ${profileResult.created} created, ${profileResult.updated} updated`);

    // Sync wager data
    await syncGoatedWagerLeaderboard();
    console.log('Manual wager sync completed');

    return {
      success: true,
      profileSync: profileResult,
      message: 'Manual synchronization completed successfully'
    };
  } catch (error) {
    console.error('Error in manual sync:', error);
    throw error;
  }
}

/**
 * Get sync task status and statistics
 * Provides information about running sync tasks
 */
export function getSyncStatus() {
  const jobs = schedule.scheduledJobs;
  
  return {
    activeJobs: Object.keys(jobs).length,
    nextProfileSync: jobs['*/10 * * * *']?.nextInvocation()?.toISOString() || 'Not scheduled',
    nextWagerSync: jobs['*/5 * * * *']?.nextInvocation()?.toISOString() || 'Not scheduled',
    uptime: process.uptime()
  };
}

/**
 * Legacy function name for backward compatibility
 * @deprecated Use profileService.syncUserProfiles() directly
 */
export async function syncUserProfiles() {
  console.warn('syncUserProfiles() in dataSyncTasks is deprecated. Use profileService.syncUserProfiles() directly.');
  return await profileService.syncUserProfiles();
}

/**
 * Legacy wager sync function for backward compatibility
 * @deprecated Use wagerLeaderboardSync.syncWagerData() directly
 */
export async function syncWagerData() {
  console.warn('syncWagerData() in dataSyncTasks is deprecated. Use syncGoatedWagerLeaderboard() directly.');
  return await syncGoatedWagerLeaderboard();
}

// For compatibility with the sync functions in platformApiService
export { profileService as platformApiService };