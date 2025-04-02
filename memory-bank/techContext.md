# GoatedVips Technical Context

## Technology Stack

### Frontend
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **Build Tool**: Vite for fast development and optimized builds
- **State Management**: React Query for server state, React Context for UI state
- **Routing**: React Router for client-side navigation
- **Animation**: Framer Motion for page transitions and UI animations

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js for API routes and middleware
- **Language**: TypeScript for type safety
- **API**: RESTful endpoints with JSON responses
- **Authentication**: JWT-based authentication system
- **Database Access**: Drizzle ORM for database operations

### Database
- **Primary Database**: PostgreSQL via Supabase
- **Schema Management**: Drizzle for database schema definition and migrations
- **Data Models**: Strongly typed schemas with relationships

### External Services
- **Goated.com API**: External API integration for user data and leaderboards
- **Authentication**: Custom authentication with optional external identity linking

## Development Environment

### Tools & Utilities
- **Package Manager**: npm for dependency management
- **Version Control**: Git for source code management
- **TypeScript**: For type safety across frontend and backend
- **Testing**: Vitest for unit and integration tests
- **Linting**: ESLint for code quality
- **Formatting**: Prettier for consistent code style

### Local Development Setup
- Local development server with hot module reloading
- Environment variable management for secure configuration
- Database migration utilities for schema changes
- Local API token management for external service testing

## Deployment Architecture

### Hosting
- Web application deployed to cloud hosting
- Database hosted on managed PostgreSQL service (Supabase)
- Static assets served from CDN for performance

### API Architecture
- Secured API endpoints with authentication middleware
- Rate limiting for protection against abuse
- CORS configuration for security
- HTTP-only cookies for authentication tokens

## Security Considerations

### Authentication
- JWT-based authentication system
- Secure password hashing
- Token refresh mechanism
- Protection against common attacks (CSRF, XSS)

### API Security
- Token-based authentication for Goated.com API
- Secure token storage and management
- API request validation
- API rate limiting

### Data Protection
- User data encryption where appropriate
- Secure API token handling
- Environment variable protection for sensitive credentials

## Performance Considerations

- Optimized React rendering with proper component design
- Efficient database queries with indexes
- API response caching where appropriate
- Lazy loading of application modules
- Optimized asset loading and delivery

## Development Workflows

### Pull Requests
- Feature branches for new development
- Pull request reviews before merging
- Automated tests on PR submission

### Testing Strategy
- Unit tests for critical business logic
- Integration tests for API endpoints
- End-to-end tests for key user flows

### Deployment Process
- Staging environment for pre-production testing
- Production deployment with database migration handling
- Rollback procedures for failed deployments
