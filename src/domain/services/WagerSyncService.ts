import { WagerSyncLog, WagerTimeframe } from '../entities/WagerAdjustment';
import { ComputedWagerStats } from '../entities/WagerAdjustment';
import { IWagerAdjustmentRepository } from '../repositories/IWagerAdjustmentRepository';
import { ICacheService } from '../../infrastructure/cache/ICacheService';
import { UserService } from './UserService';

interface ExternalApiUser {
  uid: string;
  name: string;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
  rank: number;
}

interface ExternalApiResponse {
  success: boolean;
  data: ExternalApiUser[];
  metadata: {
    totalUsers: number;
    lastUpdated: string;
    source: string;
    timeframe: string;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class WagerSyncService {
  private readonly API_BASE_URL = process.env.API_BASE_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
  private readonly API_TOKEN = process.env.GOATED_API_TOKEN;
  private readonly API_TIMEOUT = 20000; // 20 seconds

  constructor(
    private wagerAdjustmentRepository: IWagerAdjustmentRepository,
    private userService: UserService,
    private cacheService: ICacheService
  ) {}

  /**
   * Sync all users' wager data from external API
   */
  async syncAllUsers(timeframe: WagerTimeframe = 'monthly'): Promise<WagerSyncLog> {
    const syncLog = await this.createSyncLog('full', timeframe);
    const startTime = Date.now();

    try {
      // Fetch all pages of data from external API
      const allUsers = await this.fetchAllUsersFromApi(timeframe);
      
      let usersProcessed = 0;
      let usersUpdated = 0;
      let usersAdded = 0;
      let errors = 0;

      for (const apiUser of allUsers) {
        try {
          await this.processApiUser(apiUser, timeframe);
          usersProcessed++;
          
          // Check if this is a new user or existing user
          const existingUser = await this.userService.findByGoatedId(apiUser.uid);
          if (existingUser) {
            usersUpdated++;
          } else {
            usersAdded++;
          }
        } catch (error) {
          console.error(`Error processing user ${apiUser.uid}:`, error);
          errors++;
        }
      }

      // Complete the sync log
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await this.completeSyncLog(syncLog.id, {
        usersProcessed,
        usersUpdated,
        usersAdded,
        errors,
        duration,
        apiStatus: 'success',
      });

      // Recalculate rankings
      await this.wagerAdjustmentRepository.recalculateAllRankings(timeframe);

      return syncLog;
    } catch (error) {
      console.error('Sync failed:', error);
      
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await this.completeSyncLog(syncLog.id, {
        usersProcessed: 0,
        usersUpdated: 0,
        usersAdded: 0,
        errors: 1,
        duration,
        apiStatus: 'failure',
        errorDetails: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      });

      throw error;
    }
  }

  /**
   * Sync specific user's wager data
   */
  async syncUser(goatedId: string, timeframe: WagerTimeframe = 'monthly'): Promise<ExternalApiUser | null> {
    try {
      // Fetch user data from external API
      const apiResponse = await this.fetchFromExternalApi(timeframe, 1000, 1); // Large limit to ensure we get the user
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Failed to fetch data from external API');
      }

      // Find the specific user
      const apiUser = apiResponse.data.find(user => user.uid === goatedId);
      if (!apiUser) {
        return null;
      }

      // Process the user data
      await this.processApiUser(apiUser, timeframe);

      return apiUser;
    } catch (error) {
      console.error(`Error syncing user ${goatedId}:`, error);
      throw error;
    }
  }

  /**
   * Get the latest sync status
   */
  async getLatestSyncStatus(timeframe?: WagerTimeframe): Promise<WagerSyncLog | null> {
    // This would need to be implemented in the repository
    // For now, return null as placeholder
    return null;
  }

  /**
   * Fetch all users from external API (handles pagination)
   */
  private async fetchAllUsersFromApi(timeframe: WagerTimeframe): Promise<ExternalApiUser[]> {
    const allUsers: ExternalApiUser[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.fetchFromExternalApi(timeframe, 50, page);
      
      if (!response.success || !response.data) {
        throw new Error(`Failed to fetch page ${page} from external API`);
      }

      allUsers.push(...response.data);
      totalPages = response.metadata?.totalPages || 1;
      page++;
      
      // Add a small delay between requests to be respectful to the API
      if (page <= totalPages) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } while (page <= totalPages);

    return allUsers;
  }

  /**
   * Fetch data from external API
   */
  private async fetchFromExternalApi(
    timeframe: WagerTimeframe,
    limit: number = 50,
    page: number = 1
  ): Promise<ExternalApiResponse> {
    const apiTimeframe = timeframe === 'daily' ? 'daily' : timeframe;
    const url = `${this.API_BASE_URL}?timeframe=${apiTimeframe}&limit=${limit}&page=${page}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.API_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Process a single user from the API response
   */
  private async processApiUser(apiUser: ExternalApiUser, timeframe: WagerTimeframe): Promise<void> {
    // Check if user exists in our system
    let user = await this.userService.findByGoatedId(apiUser.uid);
    
    if (!user) {
      // Create a basic user record if they don't exist
      user = await this.userService.createUser({
        username: apiUser.name,
        email: `${apiUser.uid}@goated.placeholder`, // Placeholder email
        passwordHash: 'external_user', // External users can't login
        goatedId: apiUser.uid,
        goatedUsername: apiUser.name,
        goatedLinked: true,
        goatedVerified: true,
        role: 'user',
        status: 'active',
      });
    }

    // Update/create the raw wager stats in our database
    const rawStats = {
      userId: user.id,
      goatedId: apiUser.uid,
      username: apiUser.name,
      rawDailyWager: apiUser.wagered.today,
      rawWeeklyWager: apiUser.wagered.this_week,
      rawMonthlyWager: apiUser.wagered.this_month,
      rawAllTimeWager: apiUser.wagered.all_time,
    };

    // Get existing computed stats or create new ones
    let computedStats = await this.wagerAdjustmentRepository.getComputedStats(user.id);
    
    if (!computedStats) {
      // Create new computed stats
      computedStats = {
        ...rawStats,
        totalDailyAdjustment: 0,
        totalWeeklyAdjustment: 0,
        totalMonthlyAdjustment: 0,
        totalAllTimeAdjustment: 0,
        finalDailyWager: rawStats.rawDailyWager,
        finalWeeklyWager: rawStats.rawWeeklyWager,
        finalMonthlyWager: rawStats.rawMonthlyWager,
        finalAllTimeWager: rawStats.rawAllTimeWager,
        hasAdjustments: false,
        adjustmentCount: 0,
        lastApiSync: new Date(),
        updatedAt: new Date(),
        computedAt: new Date(),
      };
    } else {
      // Update raw amounts and recalculate finals
      computedStats = {
        ...computedStats,
        ...rawStats,
        finalDailyWager: Math.max(0, rawStats.rawDailyWager + computedStats.totalDailyAdjustment),
        finalWeeklyWager: Math.max(0, rawStats.rawWeeklyWager + computedStats.totalWeeklyAdjustment),
        finalMonthlyWager: Math.max(0, rawStats.rawMonthlyWager + computedStats.totalMonthlyAdjustment),
        finalAllTimeWager: Math.max(0, rawStats.rawAllTimeWager + computedStats.totalAllTimeAdjustment),
        lastApiSync: new Date(),
        updatedAt: new Date(),
      };
    }

    // Save the updated computed stats
    await this.wagerAdjustmentRepository.upsertComputedStats(computedStats);

    // Invalidate relevant caches
    await this.invalidateUserCaches(user.id, apiUser.uid);
  }

  /**
   * Create a new sync log entry
   */
  private async createSyncLog(syncType: 'full' | 'incremental' | 'user_specific', timeframe: WagerTimeframe): Promise<WagerSyncLog> {
    const syncLog: WagerSyncLog = {
      id: crypto.randomUUID(),
      syncType,
      timeframe,
      usersProcessed: 0,
      usersUpdated: 0,
      usersAdded: 0,
      errors: 0,
      startedAt: new Date(),
      createdAt: new Date(),
    };

    // Save to database (would need repository method)
    // For now, just return the log
    return syncLog;
  }

  /**
   * Complete a sync log with results
   */
  private async completeSyncLog(
    syncLogId: string,
    results: {
      usersProcessed: number;
      usersUpdated: number;
      usersAdded: number;
      errors: number;
      duration: number;
      apiStatus: 'success' | 'failure' | 'partial';
      errorDetails?: Record<string, any>;
    }
  ): Promise<void> {
    // Update the sync log in database
    // This would need repository implementation
    console.log(`Sync completed:`, results);
  }

  /**
   * Invalidate user-related caches
   */
  private async invalidateUserCaches(userId: string, goatedId: string): Promise<void> {
    const cacheKeys = [
      `computed_wager_stats:${userId}`,
      `user:${userId}`,
      `user:goated:${goatedId}`,
      `leaderboard:*`, // Invalidate all leaderboard caches
    ];

    for (const key of cacheKeys) {
      if (key.includes('*')) {
        await this.cacheService.deletePattern(key);
      } else {
        await this.cacheService.delete(key);
      }
    }
  }

  /**
   * Schedule automatic sync (to be called by cron job)
   */
  async scheduleSync(): Promise<void> {
    try {
      console.log('Starting scheduled wager sync...');
      await this.syncAllUsers('monthly');
      console.log('Scheduled wager sync completed successfully');
    } catch (error) {
      console.error('Scheduled wager sync failed:', error);
      // Could send alerts here
    }
  }
}