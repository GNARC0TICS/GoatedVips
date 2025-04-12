# GoatedVIPs Platform Features

## WagerRaces System

### Race Types
- **Monthly Race**: Primary race type with $500 prize pool distributed among top 10 players
- **Weekly Race**: Shorter-term competition focused on weekly wager totals
- **Weekend Race**: Special event races that run during weekends only

### Prize Distribution
The monthly race has a $500 prize pool distributed as follows:
1. 1st Place: $212.50 (42.5%)
2. 2nd Place: $100.00 (20%)
3. 3rd Place: $60.00 (15%)
4. 4th Place: $30.00 (7.5%)
5. 5th Place: $24.00 (6%)
6. 6th Place: $16.00 (4%)
7. 7th Place: $11.00 (2.75%)
8. 8th Place: $9.00 (2.25%)
9. 9th Place: $7.00 (1.75%)
10. 10th Place: $7.00 (1.75%)

### Race States
- **Live**: Currently active race accepting new wagers
- **Completed**: Finished race with final standings and prizes
- **Transition**: Brief period between race completion and new race start

### Technical Implementation
- Real-time updates via WebSocket connections
- Leaderboard data synced from Goated.com API
- Automatic prize distribution after race completion
- Countdown timers for race start/end events
- Animated podium display for top 3 finishers

## Tier System

### Tier Levels
The platform implements a tier system based on all-time wager amounts:
1. **Bronze**: Entry-level tier (0 - 10,000)
2. **Silver**: Mid-level tier (10,000 - 100,000)
3. **Gold**: High tier (100,000 - 500,000)
4. **Platinum**: Elite tier (500,000 - 1,000,000)
5. **Diamond**: Premium tier (1,000,000 - 5,000,000)
6. **Master**: Expert tier (5,000,000 - 10,000,000)
7. **Legend**: Highest tier (10,000,000+)

### Tier Benefits
- Exclusive platform features based on tier level
- Special emblems displayed on user profiles
- Prioritized support for higher tiers
- Enhanced race prizes for top-tier players
- Access to exclusive promotions and events

### Tier Visualization
- Custom SVG emblems for each tier level
- Progress indicators showing advancement toward next tier
- Tier-specific color schemes in user interface elements
- Special animations for high-tier users

## User Profile System

### Profile Components
- **Basic Information**: Username, join date, profile color
- **Statistics**: Wager data across different time periods
- **Verification Status**: Goated.com account verification status
- **Achievement Showcase**: Displaying race winnings and achievements
- **Tier Status**: Current tier with progress to next tier

### Profile Types
- **Standard Profile**: Basic user profile with limited information
- **Verified Profile**: Enhanced profile with Goated.com account connection
- **VIP Profile**: High-tier users with additional customization options

### Technical Features
- Dynamic profile emblem generation
- Real-time statistic updates
- Profile editing capabilities with validation
- Responsive design for all device types

## Goated.com Integration

### Account Linking
- Secure verification flow connecting platform accounts to Goated.com
- Verification status indicators on profiles
- Manual verification process for special cases
- Admin verification queue management

### Data Synchronization
- Regular syncing of user data from Goated.com API
- Wager stats synchronization at timed intervals
- Race standings updates via real-time connections
- Error handling for API connectivity issues

### Transformation Pipeline
- Raw API data processing through standardized pipeline
- Normalization of data formats for consistent presentation
- Filtering of sensitive information
- Caching layer for improved performance

## Search Functionality

### User Search
- Real-time user search across platform database
- Results matching username or Goated.com username
- Intelligent ranking of search results by relevance
- Recent search history storage and presentation

### Technical Implementation
- Debounced search input to prevent excessive API calls
- Minimum 2-character requirement for searches
- Pagination support for large result sets
- Mobile-optimized interface with responsive design