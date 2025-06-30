
# GoatedVIPs Development Standards - SuperClaude Framework

## Evidence-Based Development Principles

### Language Standards
**PROHIBITED TERMS** (use evidence instead):
- "best" → "documented as effective in [source]"
- "optimal" → "benchmarked with [X]% improvement"
- "faster" → "measured [X]ms faster than baseline"
- "secure" → "validated against OWASP standards"
- "better" → "metrics show [specific improvement]"
- "always/never" → "in [X]% of tested cases"

**REQUIRED EVIDENCE PHRASES**:
- "testing confirms that..."
- "benchmarks demonstrate..."
- "documentation states..."
- "metrics indicate..."
- "research shows..."

### Code Quality Standards

#### Architecture Principles
```typescript
// Domain-Driven Design (DDD)
// ✅ Good: Clear domain boundaries
export class WagerRace {
  constructor(
    private readonly id: RaceId,
    private readonly configuration: RaceConfiguration,
    private readonly participants: Participant[]
  ) {}
  
  public startRace(): void {
    // Domain logic here
  }
}

// ❌ Avoid: Anemic domain models
export interface WagerRace {
  id: string;
  startTime: Date;
  participants: string[];
}
```

#### Clean Code Patterns
```typescript
// ✅ Good: Single responsibility, descriptive naming
export class AffiliateStatsCalculator {
  calculate(wagers: Wager[], timeframe: Timeframe): AffiliateStats {
    const totalWager = this.calculateTotalWager(wagers);
    const commission = this.calculateCommission(totalWager);
    return new AffiliateStats(totalWager, commission);
  }
  
  private calculateTotalWager(wagers: Wager[]): number {
    return wagers.reduce((sum, wager) => sum + wager.amount, 0);
  }
}

// ❌ Avoid: Complex, unclear functions
export function processData(data: any[]): any {
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result += data[i].amount || 0;
    // Complex calculations...
  }
  return { total: result, commission: result * 0.1 };
}
```

#### Security-First Coding
```typescript
// ✅ Good: Input validation and sanitization
export class UserController {
  async createUser(request: CreateUserRequest): Promise<User> {
    // Validate input
    const validatedData = await this.validator.validate(request);
    
    // Sanitize sensitive data
    const sanitizedData = this.sanitizer.sanitize(validatedData);
    
    // Hash passwords
    const hashedPassword = await this.authService.hashPassword(sanitizedData.password);
    
    return this.userService.create({
      ...sanitizedData,
      password: hashedPassword
    });
  }
}

// ❌ Avoid: Direct database operations without validation
export class UserController {
  async createUser(request: any): Promise<any> {
    return this.db.users.create(request);
  }
}
```

## Platform-Specific Standards

### GoatedVIPs API Standards
```typescript
// ✅ Good: Consistent API response structure
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// ✅ Good: Proper error handling
export class AffiliateController {
  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.affiliateService.getStats(req.params.id);
      
      res.json({
        status: 'success',
        data: stats,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0'
        }
      });
    } catch (error) {
      this.logger.error('Failed to get affiliate stats', { error, userId: req.params.id });
      
      res.status(500).json({
        status: 'error',
        error: {
          code: 'AFFILIATE_STATS_ERROR',
          message: 'Failed to retrieve affiliate statistics'
        }
      });
    }
  }
}
```

### Real-time Features Standards
```typescript
// ✅ Good: WebSocket connection management
export class WagerRaceWebSocketService {
  private connections = new Map<string, WebSocket>();
  
  public handleConnection(ws: WebSocket, userId: string): void {
    // Validate user authentication
    if (!this.authService.validateToken(ws.protocol)) {
      ws.close(1008, 'Invalid authentication');
      return;
    }
    
    // Rate limiting
    if (!this.rateLimiter.allowConnection(userId)) {
      ws.close(1008, 'Rate limit exceeded');
      return;
    }
    
    this.connections.set(userId, ws);
    this.setupHeartbeat(ws, userId);
  }
  
  private setupHeartbeat(ws: WebSocket, userId: string): void {
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        this.connections.delete(userId);
        clearInterval(interval);
      }
    }, 30000);
  }
}
```

### Frontend Component Standards
```tsx
// ✅ Good: Accessible, performant React component
export const LeaderboardTable: React.FC<LeaderboardProps> = ({ 
  entries, 
  loading, 
  onUserSelect 
}) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField>('totalWager');
  
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      return typeof aValue === 'number' ? bValue - aValue : 0;
    });
  }, [entries, sortField]);
  
  if (loading) {
    return <LeaderboardSkeleton />;
  }
  
  return (
    <div 
      role="table" 
      aria-label={t('leaderboard.table.label')}
      className="leaderboard-table"
    >
      <div role="row" className="table-header">
        <button
          role="columnheader"
          aria-sort={sortField === 'totalWager' ? 'descending' : 'none'}
          onClick={() => setSortField('totalWager')}
          className="sort-button"
        >
          {t('leaderboard.columns.totalWager')}
          <SortIcon direction={sortField === 'totalWager' ? 'desc' : 'none'} />
        </button>
      </div>
      
      {sortedEntries.map((entry, index) => (
        <LeaderboardRow
          key={entry.userId}
          entry={entry}
          rank={index + 1}
          onSelect={() => onUserSelect(entry.userId)}
        />
      ))}
    </div>
  );
};
```

## Testing Standards

### Test-Driven Development (TDD)
```typescript
// ✅ Good: Comprehensive test coverage
describe('AffiliateStatsService', () => {
  let service: AffiliateStatsService;
  let mockRepository: jest.Mocked<IAffiliateRepository>;
  
  beforeEach(() => {
    mockRepository = createMockRepository();
    service = new AffiliateStatsService(mockRepository);
  });
  
  describe('calculateStats', () => {
    it('should calculate total wager amount correctly', async () => {
      // Arrange
      const wagers = [
        createWager({ amount: 100 }),
        createWager({ amount: 200 }),
        createWager({ amount: 300 })
      ];
      mockRepository.getWagers.mockResolvedValue(wagers);
      
      // Act
      const stats = await service.calculateStats('user-123', 'daily');
      
      // Assert
      expect(stats.totalWager).toBe(600);
      expect(mockRepository.getWagers).toHaveBeenCalledWith('user-123', 'daily');
    });
    
    it('should handle empty wager list', async () => {
      // Arrange
      mockRepository.getWagers.mockResolvedValue([]);
      
      // Act
      const stats = await service.calculateStats('user-123', 'daily');
      
      // Assert
      expect(stats.totalWager).toBe(0);
      expect(stats.commission).toBe(0);
    });
    
    it('should throw error for invalid user ID', async () => {
      // Arrange
      mockRepository.getWagers.mockRejectedValue(new Error('User not found'));
      
      // Act & Assert
      await expect(service.calculateStats('invalid-id', 'daily'))
        .rejects.toThrow('User not found');
    });
  });
});
```

### Integration Testing
```typescript
// ✅ Good: API integration testing
describe('Affiliate API Integration', () => {
  let app: Express;
  let testDb: TestDatabase;
  
  beforeAll(async () => {
    testDb = await setupTestDatabase();
    app = createTestApp(testDb);
  });
  
  afterAll(async () => {
    await testDb.cleanup();
  });
  
  describe('GET /api/affiliate/stats', () => {
    it('should return affiliate statistics', async () => {
      // Arrange
      const user = await testDb.createUser({ affiliateId: 'test-affiliate' });
      await testDb.createWagers([
        { userId: user.id, amount: 100 },
        { userId: user.id, amount: 200 }
      ]);
      
      // Act
      const response = await request(app)
        .get('/api/affiliate/stats')
        .set('Authorization', `Bearer ${user.token}`)
        .query({ timeframe: 'daily' });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'success',
        data: {
          totalWager: 300,
          commission: expect.any(Number),
          rank: expect.any(Number)
        }
      });
    });
  });
});
```

## Performance Standards

### Database Optimization
```typescript
// ✅ Good: Optimized queries with proper indexing
export class AffiliateRepository {
  async getTopPerformers(timeframe: Timeframe, limit: number): Promise<AffiliateStats[]> {
    // Use indexed columns and proper query structure
    const query = `
      SELECT 
        u.id,
        u.username,
        SUM(w.amount) as total_wager,
        COUNT(w.id) as wager_count,
        RANK() OVER (ORDER BY SUM(w.amount) DESC) as rank
      FROM users u
      INNER JOIN wagers w ON u.id = w.user_id
      WHERE w.created_at >= $1
      GROUP BY u.id, u.username
      ORDER BY total_wager DESC
      LIMIT $2
    `;
    
    const startDate = this.getTimeframeStartDate(timeframe);
    return this.db.query(query, [startDate, limit]);
  }
}

// ❌ Avoid: N+1 queries and inefficient operations
export class BadAffiliateRepository {
  async getTopPerformers(): Promise<any[]> {
    const users = await this.db.query('SELECT * FROM users');
    const results = [];
    
    for (const user of users) {
      const wagers = await this.db.query('SELECT * FROM wagers WHERE user_id = $1', [user.id]);
      const total = wagers.reduce((sum, w) => sum + w.amount, 0);
      results.push({ user, total });
    }
    
    return results.sort((a, b) => b.total - a.total);
  }
}
```

### Caching Strategy
```typescript
// ✅ Good: Intelligent caching with proper invalidation
export class CachedAffiliateService {
  constructor(
    private affiliateService: AffiliateService,
    private cache: ICacheService
  ) {}
  
  async getLeaderboard(timeframe: Timeframe): Promise<AffiliateStats[]> {
    const cacheKey = `leaderboard:${timeframe}`;
    const cached = await this.cache.get<AffiliateStats[]>(cacheKey);
    
    if (cached) {
      return cached;
    }
    
    const leaderboard = await this.affiliateService.getLeaderboard(timeframe);
    
    // Cache with appropriate TTL based on timeframe
    const ttl = this.getTTLForTimeframe(timeframe);
    await this.cache.set(cacheKey, leaderboard, ttl);
    
    return leaderboard;
  }
  
  private getTTLForTimeframe(timeframe: Timeframe): number {
    const ttlMap = {
      'daily': 300,    // 5 minutes
      'weekly': 1800,  // 30 minutes
      'monthly': 3600, // 1 hour
      'all_time': 7200 // 2 hours
    };
    return ttlMap[timeframe] || 300;
  }
}
```

## Security Standards

### Authentication & Authorization
```typescript
// ✅ Good: Secure JWT implementation
export class JWTAuthService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenTTL = 15 * 60; // 15 minutes
  private readonly refreshTokenTTL = 7 * 24 * 60 * 60; // 7 days
  
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET!;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets must be configured');
    }
  }
  
  public generateAccessToken(user: User): string {
    return jwt.sign(
      { 
        sub: user.id,
        username: user.username,
        role: user.role,
        type: 'access'
      },
      this.accessTokenSecret,
      { 
        expiresIn: this.accessTokenTTL,
        issuer: 'goatedvips',
        audience: 'goatedvips-app'
      }
    );
  }
  
  public verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.accessTokenSecret, {
        issuer: 'goatedvips',
        audience: 'goatedvips-app'
      }) as TokenPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }
}
```

### Input Validation
```typescript
// ✅ Good: Comprehensive input validation
export class UserValidationService {
  private readonly schemas = {
    createUser: z.object({
      username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must not exceed 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      email: z.string().email('Invalid email format'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number')
    }),
    
    updateProfile: z.object({
      bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
      avatar: z.string().url('Invalid avatar URL').optional(),
      preferences: z.object({
        notifications: z.boolean(),
        privacy: z.enum(['public', 'private'])
      }).optional()
    })
  };
  
  public async validateCreateUser(data: unknown): Promise<CreateUserRequest> {
    const result = await this.schemas.createUser.safeParseAsync(data);
    
    if (!result.success) {
      throw new ValidationError('Invalid user data', result.error.errors);
    }
    
    // Additional business rule validation
    const existingUser = await this.userRepository.findByUsername(result.data.username);
    if (existingUser) {
      throw new ValidationError('Username already exists');
    }
    
    return result.data;
  }
}
```

## Error Handling Standards

### Structured Error Handling
```typescript
// ✅ Good: Comprehensive error handling
export class ErrorHandler {
  public static handle(error: Error, req: Request, res: Response, next: NextFunction): void {
    const logger = Container.get(Logger);
    
    // Log error with context
    logger.error('Request failed', {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      requestId: req.id
    });
    
    // Handle specific error types
    if (error instanceof ValidationError) {
      res.status(400).json({
        status: 'error',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.details
        }
      });
      return;
    }
    
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        status: 'error',
        error: {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication required'
        }
      });
      return;
    }
    
    // Generic error response (don't expose internal details)
    res.status(500).json({
      status: 'error',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
}
```

## Documentation Standards

### API Documentation
```typescript
/**
 * Retrieves affiliate statistics for a specific timeframe
 * 
 * @route GET /api/affiliate/stats
 * @param {Timeframe} timeframe - The timeframe for statistics (daily, weekly, monthly, all_time)
 * @param {number} limit - Maximum number of results to return (default: 10, max: 100)
 * @param {number} page - Page number for pagination (default: 1)
 * @returns {Promise<ApiResponse<AffiliateStatsResponse>>} Affiliate statistics
 * 
 * @example
 * GET /api/affiliate/stats?timeframe=daily&limit=10&page=1
 * 
 * Response:
 * {
 *   "status": "success",
 *   "data": {
 *     "entries": [
 *       {
 *         "userId": "user-123",
 *         "username": "player1",
 *         "totalWager": 1500.00,
 *         "commission": 75.00,
 *         "rank": 1
 *       }
 *     ],
 *     "total": 1,
 *     "timeframe": "daily"
 *   }
 * }
 * 
 * @throws {ValidationError} When request parameters are invalid
 * @throws {AuthenticationError} When user is not authenticated
 * @throws {RateLimitError} When rate limit is exceeded
 */
```

These standards ensure that every aspect of the GoatedVIPs platform maintains the highest quality, security, and performance while following evidence-based development practices.
