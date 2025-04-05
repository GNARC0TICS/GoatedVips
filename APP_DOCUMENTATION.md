
# GoatedVIPs Platform Documentation

## Overview
GoatedVIPs is an independent platform created by an established Goated.com affiliate partner. The platform serves as a community hub for players referred under the GoatedVips affiliate code, offering enhanced statistics tracking, wager race participation, and exclusive rewards. While the creator maintains a successful VIP community on Goated.com, this platform is not officially affiliated with or endorsed by Goated.com - it operates independently as an affiliate marketing initiative.

The platform's primary goal is to provide an exclusive experience for players who choose to play under the GoatedVips affiliate code, fostering a community-driven approach to rewards and competition. Through this platform, users can track their performance, participate in community challenges, and compete in wager races while enjoying additional community benefits.

## System Architecture

### Domain Setup
The platform operates across two distinct domains:
1. **GoatedVIPs.gg (Public Domain)** - Main user-facing application
2. **Goombas.net (Admin Domain)** - Secure administrative interface

### Data Flow
```
External API -> Transform Service -> Database -> WebSocket -> UI Update
```

### Core Components
### Core Components
1. **Main Server (Port 5000)**
   - Express.js REST API
   - Real-time WebSocket updates
   - Rate limiting & security middleware
   - Database operations
   - Domain-based routing system
   - User verification
   - Admin commands
   - Real-time notifications
   - Challenge management
   - Challenge management

### Domain Routing System
The platform implements a sophisticated domain routing system that:
- Detects incoming domain requests
- Routes requests to appropriate handlers
- Enforces domain-specific security measures
- Separates public and admin functionality

```typescript
// Domain detection middleware
app.use(domainRedirectMiddleware);

// Domain-specific middleware
adminDomainOnly - Restricts routes to Goombas.net domain
publicDomainOnly - Restricts routes to GoatedVIPs.gg domain
```

### Admin Interface Architecture
The admin interface (Goombas.net) is completely separated from the public interface:
- Custom build process with separate entry point
- Domain-specific authentication
- Enhanced security measures
- Administrator-only API endpoints

### Database Schema

```sql
Table wager_races {
  id UUID PRIMARY KEY
  status VARCHAR
  start_date TIMESTAMP
  end_date TIMESTAMP
  prize_pool DECIMAL
}

Table users {
  id UUID PRIMARY KEY
  goated_id VARCHAR UNIQUE
  telegram_id VARCHAR UNIQUE
  username VARCHAR
  email VARCHAR
  password_hash VARCHAR
  total_wagered DECIMAL
  weekly_wagered DECIMAL
  monthly_wagered DECIMAL
  goated_account_linked BOOLEAN
  verification_status VARCHAR
  created_at TIMESTAMP
}

Table verification_requests {
  id INTEGER PRIMARY KEY
  user_id INTEGER REFERENCES users(id)
  telegram_id VARCHAR NOT NULL
  telegram_username VARCHAR NOT NULL
  goated_username VARCHAR NOT NULL
  status VARCHAR DEFAULT 'pending'
  verified_by VARCHAR
  verified_at TIMESTAMP
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  admin_notes TEXT
}

Table transformation_logs {
  id UUID PRIMARY KEY
  type VARCHAR
  message TEXT
  duration_ms INTEGER
  created_at TIMESTAMP
}

Table api_sync_metadata {
  id UUID PRIMARY KEY
  endpoint VARCHAR NOT NULL
  last_sync_time TIMESTAMP NOT NULL
  record_count INTEGER
  etag VARCHAR
  last_modified VARCHAR
  response_hash VARCHAR
  is_full_sync BOOLEAN DEFAULT false
  sync_duration_ms INTEGER
  metadata JSONB
}
```

## API Rate Limits
- High: 30 requests/minute
- Medium: 15 requests/minute
- Low: 5 requests/minute
- Cache duration: 30 seconds for high-traffic endpoints

## WebSocket Channels
- `/ws/leaderboard` - Race updates
- `/ws/transformation-logs` - System monitoring
- Configuration:
  - Ping interval: 30 seconds
  - Auto-reconnection enabled
  - Connection health monitoring

## Core API Endpoints
- `/api/wager-races/current` - Active race data
- `/api/affiliate/stats` - Performance metrics
- `/api/admin/analytics` - System analytics
- `/api/telegram/status` - Bot health check
- `/api/verification/request` - Submit verification request
- `/api/verification/status/:goatedId` - Check verification status
- `/api/verification/admin/requests` - Admin view of verification queue
- `/api/verification/admin/action/:requestId` - Approve/reject verifications

### Admin-Specific Endpoints
- `/goombas.net/login` - Secure admin authentication
- `/goombas.net/logout` - Admin session termination
- `/goombas.net/auth-status` - Session status check
- `/goombas.net/users` - User data management
- `/analytics` - System analytics (domain-restricted)

## Security Implementation
1. **Authentication**
   - JWT-based session management
   - Telegram verification flow
   - Admin role verification
   - Domain-specific authentication

2. **Rate Limiting**
   - Tiered rate limits
   - IP-based restrictions
   - Cache implementation

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - Domain-specific access controls
   - Content Security Policy headers

## Real-time Features
1. **Race Updates**
   - Live leaderboard updates
   - Real-time statistics
   - WebSocket-based notifications

2. **User Verification**
   - Instant status updates
   - Admin verification queue
   - Rate-limited verification requests (5 per hour per IP)
   - External profile claiming with validation
   - Goated ID linking and profile verification
   - Telegram account association

## Admin Features
1. **Dashboard Controls**
   - User management
   - Race configuration
   - System analytics
   - API synchronization monitoring

2. **Monitoring Tools**
   - Performance metrics
   - Error logging
   - User activity tracking
   - API sync metadata tracking

3. **Domain-Specific Admin Interface**
   - Secure admin login
   - Enhanced analytics dashboard
   - Administration tools
   - User management system

## Error Handling
```typescript
interface TransformationResult {
  success: boolean;
  data?: {
    wagers: number;
    profit: number;
    activeUsers: number;
  };
  error?: string;
  duration: number;
}
```

## Development Guidelines

### Code Structure
- `server/` - Backend implementation
- `client/src/` - Frontend React components
- `client/src/admin.tsx` - Admin application entry point
- `db/schema/` - Database models
- `telegram/` - Bot implementation
- `server/middleware/domain-router.ts` - Domain routing system

### Best Practices
1. **Performance**
   - Implement caching
   - Optimize database queries
   - Use proper indexing
   - Monitor WebSocket connections

2. **Security**
   - Rate limit all endpoints
   - Validate all inputs
   - Implement proper authentication
   - Add audit logging
   - Use domain-specific access controls

3. **Maintenance**
   - Regular dependency updates
   - Performance monitoring
   - Error tracking
   - Database optimization
   - API sync monitoring

### Deployment Configuration
- Production server setup
- Database migration process
- Backup procedures
- Monitoring setup
- Domain configuration

## Integration Points
1. **External APIs**
   - Affiliate tracking
   - Payment processing
   - Analytics services

2. **Telegram Integration**
   - Bot commands
   - User verification
   - Admin notifications

## Testing Requirements
1. **Unit Tests**
   - API endpoints
   - Data transformations
   - Authentication flows

2. **Integration Tests**
   - WebSocket connections
   - Database operations
   - External API calls
   - Domain routing

3. **Performance Tests**
   - Load testing
   - Stress testing
   - Real-time updates

## Future Roadmap
1. **Technical Improvements**
   - Enhanced error handling
   - Improved caching
   - Better TypeScript coverage
   - Automated testing

2. **Feature Enhancements**
   - Advanced analytics
   - Enhanced VIP features
   - Improved notifications
   - Extended admin controls

3. **Infrastructure**
   - Improved monitoring
   - Enhanced security
   - Better scalability
   - Backup solutions
