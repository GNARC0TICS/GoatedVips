# GoatedVIPs Database & Data Structure

## Database Schema Overview

The platform uses PostgreSQL with Drizzle ORM, implementing a carefully designed schema to support all features while maintaining optimal performance.

### Core Tables

#### Users Table
```typescript
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password"),
  bio: text("bio"),
  profileColor: text("profile_color").default("#D7FF00"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isAdmin: boolean("is_admin").default(false),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  goatedId: text("goated_id").unique(),
  goatedUsername: text("goated_username"),
  goatedAccountLinked: boolean("goated_account_linked").default(false),
  totalWager: text("total_wager"),
  dailyWager: text("daily_wager"),
  weeklyWager: text("weekly_wager"),
  monthlyWager: text("monthly_wager"),
  lastWagerSync: timestamp("last_wager_sync"),
  lastUpdated: timestamp("last_updated")
});
```

#### Wager Races Table
```typescript
export const wagerRaces = pgTable("wager_races", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["daily", "weekly", "monthly", "special"] }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ["scheduled", "live", "completed", "cancelled"] }).default("scheduled"),
  prizePool: numeric("prize_pool").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata")
});
```

#### Wager Race Participants Table
```typescript
export const wagerRaceParticipants = pgTable("wager_race_participants", {
  id: serial("id").primaryKey(),
  raceId: integer("race_id").references(() => wagerRaces.id),
  userId: integer("user_id").references(() => users.id),
  goatedId: text("goated_id"),
  wagered: numeric("wagered").default("0"),
  position: integer("position"),
  prize: numeric("prize"),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastUpdated: timestamp("last_updated")
});
```

#### Transformation Logs Table
```typescript
export const transformationLogs = pgTable("transformation_logs", {
  id: serial("id").primaryKey(),
  transformationType: text("transformation_type").notNull(),
  sourceType: text("source_type").notNull(),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status", { enum: ["running", "completed", "failed"] }).default("running"),
  error: text("error"),
  metadata: jsonb("metadata")
});
```

#### Sync Logs Table
```typescript
export const syncLogs = pgTable("sync_logs", {
  id: serial("id").primaryKey(),
  syncType: text("sync_type").notNull(),
  targetEntity: text("target_entity").notNull(),
  recordsProcessed: integer("records_processed").default(0),
  recordsCreated: integer("records_created").default(0),
  recordsUpdated: integer("records_updated").default(0),
  recordsSkipped: integer("records_skipped").default(0),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status", { enum: ["running", "completed", "failed"] }).default("running"),
  error: text("error"),
  metadata: jsonb("metadata")
});
```

### Table Relationships

```typescript
// User relationships
export const userRelations = relations(users, ({ many }) => ({
  wagerRaceParticipants: many(wagerRaceParticipants),
  wheelSpins: many(wheelSpins),
  bonusCodes: many(bonusCodes),
  supportTickets: many(supportTickets)
}));

// Wager race relationships
export const wagerRaceRelations = relations(wagerRaces, ({ many }) => ({
  participants: many(wagerRaceParticipants)
}));

// Wager race participant relationships
export const wagerRaceParticipantRelations = relations(
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
```

## Data Types & Interfaces

### Core Types

#### User Types
```typescript
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export interface UserProfile {
  id: number;
  username: string;
  bio?: string;
  profileColor: string;
  createdAt: Date;
  goatedId?: string;
  goatedUsername?: string;
  goatedAccountLinked: boolean;
  totalWager?: string;
  wager?: {
    all_time: number;
    monthly: number;
    weekly: number;
    daily: number;
  };
  lastWagerSync?: Date;
}
```

#### Wager Race Types
```typescript
export type InsertWagerRace = typeof wagerRaces.$inferInsert;
export type SelectWagerRace = typeof wagerRaces.$inferSelect;
export type InsertWagerRaceParticipant = typeof wagerRaceParticipants.$inferInsert;
export type SelectWagerRaceParticipant = typeof wagerRaceParticipants.$inferSelect;

export interface WagerRaceWithParticipants extends SelectWagerRace {
  participants: SelectWagerRaceParticipant[];
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  wagered: {
    today: number;
    this_week: number;
    this_month: number;
    all_time: number;
  };
  lastUpdate?: string;
}

export interface LeaderboardData {
  data: LeaderboardEntry[];
  metadata: {
    totalUsers: number;
    lastUpdated: string;
    status?: 'live' | 'completed' | 'transition';
  };
}
```

### API Response Types

#### User Search Response
```typescript
interface UserSearchItem {
  id: number;
  username?: string;
  profileColor?: string;
  goatedId?: string;
  goatedUsername?: string;
}

interface UserSearchResponse {
  results: UserSearchItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
```

#### Wager Race Response
```typescript
interface WagerRaceResponse {
  id: number;
  name: string;
  type: "daily" | "weekly" | "monthly" | "special";
  startDate: string;
  endDate: string;
  status: "scheduled" | "live" | "completed" | "cancelled";
  prizePool: string;
  participants: {
    userId: number;
    goatedId: string;
    username: string;
    wagered: number;
    position: number;
    prize: number;
  }[];
  metadata: {
    lastUpdated: string;
    transitionEnds?: string;
    nextRaceStart?: string;
  };
}
```

## Tier System Implementation

### Tier Definition
```typescript
export type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'legend';

export interface TierInfo {
  minWager: number;
  name: TierLevel;
  displayName: string;
  color: string;
  benefits: string[];
}

export const TIERS: Record<TierLevel, TierInfo> = {
  bronze: {
    minWager: 0,
    name: 'bronze',
    displayName: 'Bronze',
    color: '#CD7F32',
    benefits: ['Access to basic platform features', 'Entry to monthly races']
  },
  silver: {
    minWager: 10000,
    name: 'silver',
    displayName: 'Silver',
    color: '#C0C0C0',
    benefits: ['Priority customer support', 'Access to weekly promotions']
  },
  gold: {
    minWager: 100000,
    name: 'gold',
    displayName: 'Gold',
    color: '#FFD700',
    benefits: ['Exclusive monthly bonuses', 'Enhanced race rewards']
  },
  platinum: {
    minWager: 500000,
    name: 'platinum',
    displayName: 'Platinum',
    color: '#E5E4E2',
    benefits: ['VIP customer support', 'Custom profile features']
  },
  diamond: {
    minWager: 1000000,
    name: 'diamond',
    displayName: 'Diamond',
    color: '#B9F2FF',
    benefits: ['Priority verification', 'Special event invitations']
  },
  master: {
    minWager: 5000000,
    name: 'master',
    displayName: 'Master',
    color: '#FFFFFF',
    benefits: ['Exclusive platform features', 'Custom race participation']
  },
  legend: {
    minWager: 10000000,
    name: 'legend',
    displayName: 'Legend',
    color: '#FF0000',
    benefits: ['Ultimate VIP treatment', 'Highest tier privileges']
  }
};
```

## Data Flow Patterns

### User Profile Data Flow

1. **External API Data**: Raw user data from Goated.com API
   ```typescript
   interface RawUserData {
     uid: string;
     name: string;
     wagered: {
       today: number;
       this_week: number;
       this_month: number;
       all_time: number;
     };
   }
   ```

2. **Transformation**: Processing through PlatformApiService
   ```typescript
   function transformUserData(rawData: RawUserData): InsertUser {
     return {
       goatedId: rawData.uid,
       goatedUsername: rawData.name,
       totalWager: rawData.wagered.all_time.toString(),
       dailyWager: rawData.wagered.today.toString(),
       weeklyWager: rawData.wagered.this_week.toString(),
       monthlyWager: rawData.wagered.this_month.toString(),
       lastWagerSync: new Date(),
       lastUpdated: new Date()
     };
   }
   ```

3. **Database Storage**: Insertion/update in PostgreSQL
   ```typescript
   async function upsertUser(userData: InsertUser): Promise<SelectUser> {
     const existingUser = await db.query.users.findFirst({
       where: eq(users.goatedId, userData.goatedId)
     });
     
     if (existingUser) {
       return await db.update(users)
         .set(userData)
         .where(eq(users.id, existingUser.id))
         .returning();
     } else {
       return await db.insert(users)
         .values(userData)
         .returning();
     }
   }
   ```

4. **Client Consumption**: React component with React Query
   ```typescript
   function useUserProfile(userId: string) {
     return useQuery({
       queryKey: ['/api/users', userId],
       queryFn: async () => {
         const response = await fetch(`/api/users/${userId}`);
         if (!response.ok) {
           throw new Error('Failed to fetch user profile');
         }
         return response.json();
       }
     });
   }
   ```

### Wager Race Data Flow

1. **Data Collection**: Aggregating user wager data
   ```typescript
   async function aggregateWagerData(): Promise<LeaderboardEntry[]> {
     const userData = await goatedApiService.getLeaderboardData();
     return userData.data.map(user => ({
       uid: user.uid,
       name: user.name,
       wagered: user.wagered,
       lastUpdate: new Date().toISOString()
     }));
   }
   ```

2. **Race Status Update**: Processing race state
   ```typescript
   async function updateRaceStatus(raceId: number): Promise<void> {
     const race = await db.query.wagerRaces.findFirst({
       where: eq(wagerRaces.id, raceId)
     });
     
     const now = new Date();
     
     if (race.startDate <= now && race.endDate > now) {
       await db.update(wagerRaces)
         .set({ status: 'live' })
         .where(eq(wagerRaces.id, raceId));
     } else if (race.endDate <= now) {
       await db.update(wagerRaces)
         .set({ status: 'completed' })
         .where(eq(wagerRaces.id, raceId));
       
       // Trigger prize distribution
       await distributePrizes(raceId);
     }
   }
   ```

3. **WebSocket Updates**: Real-time notifications
   ```typescript
   function broadcastRaceUpdate(raceData: WagerRaceWithParticipants): void {
     wss.clients.forEach(client => {
       if (client.readyState === WebSocket.OPEN) {
         client.send(JSON.stringify({
           type: 'RACE_UPDATE',
           data: raceData
         }));
       }
     });
   }
   ```

## Data Validation Patterns

### Zod Schema Validation
```typescript
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export const insertWagerRaceSchema = createInsertSchema(wagerRaces);
export const selectWagerRaceSchema = createSelectSchema(wagerRaces);

export const ProfileUpdateSchema = z.object({
  username: z.string().optional(),
  bio: z.string().optional(),
  profileColor: z.string().optional(),
});

export const WagerRaceCreateSchema = z.object({
  name: z.string(),
  type: z.enum(["daily", "weekly", "monthly", "special"]),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  prizePool: z.number().positive(),
});
```

## Data Security & Privacy

### Data Encryption
- Passwords stored with bcrypt hashing
- Sensitive API tokens stored in environment variables
- HTTPS for all data transmission

### Data Access Controls
- Role-based access control for database operations
- User-specific data isolation
- Field-level restrictions for sensitive information

### Data Retention
- User profiles retained until explicit deletion
- Race data retained for historical analysis
- Transformation logs retained for 30 days
- API request logs retained for 7 days