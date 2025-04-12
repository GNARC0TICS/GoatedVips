# GoatedVIPs API Integration Architecture

## API Service Overview

The platform implements a sophisticated two-service architecture to handle API interactions:

### External API Service (GoatedApiService)
- **Purpose**: Manages all communication with the external Goated.com API
- **Responsibilities**:
  - Authentication with external API using bearer tokens
  - Fetching user profile data from Goated.com
  - Retrieving wager statistics for race calculations
  - Handling API retry logic and error recovery
  - Managing API request rate limiting and throttling
- **Implementation**: Server-side service with secure credential management

### Internal API Service (PlatformApiService)
- **Purpose**: Provides standardized access to platform data
- **Responsibilities**:
  - Exposing RESTful endpoints for client consumption
  - Transforming and normalizing external API data
  - Caching frequently accessed data
  - Handling authentication and authorization checks
  - Managing database interactions through Drizzle ORM
- **Implementation**: Server-side service with client-side counterpart

## Data Flow Architecture

### Data Synchronization Flow
1. **Scheduled Trigger**: Cron-based tasks initiate sync processes
2. **External Fetch**: GoatedApiService retrieves data from Goated.com API
3. **Transformation**: Raw data processed through transformation pipeline
4. **Database Storage**: Processed data stored in PostgreSQL database
5. **Cache Update**: In-memory cache refreshed with new data
6. **WebSocket Notification**: Connected clients notified of updates

### User Request Flow
1. **Client Request**: React component requests data via React Query
2. **API Call**: Request sent to internal PlatformApiService endpoint
3. **Cache Check**: Server checks if requested data exists in cache
4. **Database Retrieval**: If needed, data retrieved from database
5. **Response Formation**: Data formatted according to API response standards
6. **Client Reception**: React Query handles data caching and component updates

## Authentication & Security

### API Token Management
- Secure storage of API keys in environment variables
- Token refresh mechanism for expired credentials
- Rate limit tracking to prevent API quota exhaustion
- IP restriction for sensitive API operations

### Request Security
- HTTPS for all API communications
- JWT validation for authenticated requests
- Request signing for sensitive operations
- Input validation to prevent injection attacks

## Error Handling Strategy

### Resilient Request Pattern
1. **Initial Attempt**: Standard API request with timeout
2. **First Retry**: Immediate retry with exponential backoff
3. **Fallback**: Use cached data if available
4. **Graceful Degradation**: Display partial or cached data
5. **User Feedback**: Transparent error messaging

### Error Classification
- **Temporary Errors**: Network issues, timeouts, 5xx responses
  - Handled with automatic retries
- **Authentication Errors**: Expired tokens, permission issues
  - Trigger re-authentication flow
- **Resource Errors**: Rate limiting, quota exhaustion
  - Implement backoff strategy
- **Permanent Errors**: Invalid parameters, 4xx responses
  - Log error and display user feedback

## Caching Architecture

### Multi-Level Caching
1. **Memory Cache**: In-memory server cache for frequent access data
   - Race standings, leaderboard data, global statistics
2. **Database Cache**: Persistent cache in database
   - Historical race data, user profiles, verification status
3. **Client Cache**: React Query cache on client side
   - User interface data, personalized content

### Cache Invalidation Strategy
- **Time-Based**: Automatic expiration for volatile data
- **Event-Based**: Cache clearing on specific events (race completion)
- **Manual**: Admin tools for forced cache refresh
- **Stale-While-Revalidate**: Continue serving stale cache while refreshing

## API Response Format

### Standard Response Structure
```json
{
  "status": "success", // or "error"
  "data": {
    // Response data specific to endpoint
    // For example, wager race data:
    "id": "202504",
    "status": "live",
    "startDate": "2025-04-01T00:00:00.000Z",
    "endDate": "2025-04-30T00:00:00.000Z",
    "prizePool": 500,
    "participants": [
      {
        "uid": "f5w3IYWYL79E8HntQuPs",
        "name": "nostalgicgareth",
        "wagered": 74200.67073880868,
        "position": 1
      },
      // More participants...
    ],
    "totalWagered": 341551.1463654385,
    "participantCount": 2218,
    "metadata": {
      "transitionEnds": "2025-05-01T00:00:00.000Z",
      "nextRaceStarts": "2025-05-01T00:00:00.000Z",
      "prizeDistribution": [0.5, 0.3, 0.1, 0.05, 0.05]
    }
  }
}
```

### API Response with Pagination
For endpoints that support pagination:
```json
{
  "results": [
    // Array of results
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 2218,
    "pages": 74
  }
}
```

### Error Response Structure
```json
{
  "status": "error",
  "error": {
    "code": "API_TIMEOUT",
    "message": "Request to external API timed out",
    "details": {
      "retryable": true,
      "suggestedAction": "retry_later"
    }
  },
  "metadata": {
    "requestId": "req_12345",
    "timestamp": "2025-04-12T03:53:45.362Z"
  }
}
```

## API Endpoints

### User Endpoints
- `GET /api/users/search`: Search for users by username
- `GET /api/users/:userId`: Get user profile by ID
- `GET /api/users/:id/stats`: Get user statistics
- `PATCH /api/users/:id`: Update user profile
- `GET /api/users/batch`: Batch fetch multiple profiles

### Wager Race Endpoints
- `GET /api/wager-races/current`: Get current race standings
- `GET /api/wager-races/previous`: Get previous race results
- `GET /api/wager-races/schedule`: Get upcoming race schedule

### Affiliate Endpoints
- `GET /api/affiliate/stats`: Get affiliate program statistics
- `GET /api/affiliate/leaderboard`: Get affiliate leaderboard

### Authentication Endpoints
- `POST /api/auth/login`: User login
- `POST /api/auth/register`: User registration
- `POST /api/auth/refresh`: Refresh authentication token
- `POST /api/auth/logout`: User logout

### Verification Endpoints
- `POST /api/verification/request`: Request account verification
- `GET /api/verification/status`: Check verification status
- `POST /api/verification/confirm`: Confirm verification

## Integration Challenges & Solutions

### Challenge: API Timeouts
- **Problem**: External API occasionally experiences long response times
- **Solution**: Implemented timeout handling with fallback to cached data

### Challenge: Data Inconsistency
- **Problem**: Different data formats between API versions
- **Solution**: Standardized transformation pipeline with schema validation

### Challenge: Rate Limiting
- **Problem**: External API imposes strict rate limits
- **Solution**: Implemented request batching and staggered scheduling

### Challenge: API Downtime
- **Problem**: Occasional maintenance periods for external API
- **Solution**: Enhanced caching strategy with longer TTL during outages

## Monitoring & Analytics

### Performance Tracking
- API response time monitoring
- Cache hit/miss ratio analysis
- Error rate tracking by endpoint
- Sync job success/failure rates

### Usage Analytics
- Request volume by endpoint
- User-specific API consumption patterns
- Peak usage periods identification
- Resource utilization metrics