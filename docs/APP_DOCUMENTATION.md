// Documentation references updated to docs/ directory [2024-06-09]
# GoatedVIPs Platform Documentation

## Overview
GoatedVIPs is an independent platform created by an established Goated.com affiliate partner. The platform serves as a community hub for players referred under the GoatedVips affiliate code, offering enhanced statistics tracking, wager race participation, and exclusive rewards. While the creator maintains a successful VIP community on Goated.com, this platform is not officially affiliated with or endorsed by Goated.com - it operates independently as an affiliate marketing initiative.

The platform's primary goal is to provide an exclusive experience for players who choose to play under the GoatedVips affiliate code, fostering a community-driven approach to rewards and competition. Through this platform, users can track their performance, participate in community challenges, and compete in wager races while enjoying additional community benefits.

## System Architecture

### Data Flow
```
External API -> Transform Service -> Database -> WebSocket -> UI Update
```

### Core Components
1. **Main Server (Port 5000)**
   - Express.js REST API
   - Real-time WebSocket updates
   - Rate limiting & security middleware
   - Database operations

2. **Telegram Bot (Port 5001)**
   - User verification
   - Admin commands
   - Real-time notifications
   - Challenge management

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
  telegram_id VARCHAR UNIQUE
  username VARCHAR
  verification_status VARCHAR
  created_at TIMESTAMP
}

Table transformation_logs {
  id UUID PRIMARY KEY
  type VARCHAR
  message TEXT
  duration_ms INTEGER
  created_at TIMESTAMP
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

## Security Implementation
1. **Authentication**
   - JWT-based session management
   - Telegram verification flow
   - Admin role verification

2. **Rate Limiting**
   - Tiered rate limits
   - IP-based restrictions
   - Cache implementation

3. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection

## Real-time Features
1. **Race Updates**
   - Live leaderboard updates
   - Real-time statistics
   - WebSocket-based notifications

2. **User Verification**
   - Instant status updates
   - Admin verification queue
   - Automated checks

## Admin Features
1. **Dashboard Controls**
   - User management
   - Race configuration
   - System analytics

2. **Monitoring Tools**
   - Performance metrics
   - Error logging
   - User activity tracking

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
- `db/schema/` - Database models
- `telegram/` - Bot implementation

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

3. **Maintenance**
   - Regular dependency updates
   - Performance monitoring
   - Error tracking
   - Database optimization

### Deployment Configuration
- Production server setup
- Database migration process
- Backup procedures
- Monitoring setup

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
