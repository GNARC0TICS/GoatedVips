# Goombas x Goated VIPs v2.0 - Deployment Guide

## Overview

This is the complete deployment and setup guide for the newly architected Goombas x Goated VIPs platform v2.0. The application has been completely rewritten using a domain-driven design architecture with modern security practices and scalable infrastructure.

## Architecture Overview

### v2.0 Architecture Stack
- **Backend**: Node.js + TypeScript + Express.js
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis for session management and rate limiting
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schemas with comprehensive input sanitization
- **Security**: Helmet, CORS, rate limiting, input validation
- **Development**: tsx for TypeScript execution, concurrently for dev servers

### Key Security Improvements
- Bcrypt password hashing (12 rounds)
- JWT access tokens (15min) + refresh tokens (7 days)
- Rate limiting with sliding window algorithm
- Input sanitization and validation
- CORS configuration
- Helmet security headers
- SQL injection prevention with parameterized queries
- XSS protection

## Prerequisites

### For Local Development
- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- npm or pnpm

### For Replit Deployment
- Replit account
- PostgreSQL database (Neon recommended)
- Redis instance (optional - falls back to memory store)

## Environment Variables

Create a `.env` file with the following variables:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Redis (optional - will use memory store if not provided)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:5174,http://localhost:3000
```

## Database Setup

### 1. Database Schema
The application uses Drizzle ORM with the following key tables:

- **users**: User accounts with authentication and profile data
- **user_sessions**: JWT refresh token management
- **wagers**: Betting/gaming data
- **races**: Race/game events
- **leaderboards**: Competition rankings

### 2. Database Migration
```bash
# Install dependencies
npm install

# Run database migrations (if implemented)
npm run db:migrate

# Or manually create tables using the schema in src/infrastructure/database/schema.ts
```

### 3. Neon Database (Recommended for Production)
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string to `DATABASE_URL`
4. Database will auto-create tables on first connection

## Redis Setup (Optional)

### Local Redis
```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis-server  # Ubuntu

# Start Redis
redis-server
```

### Redis Cloud (Recommended for Production)
1. Create account at https://redis.com/try-free/
2. Create new database
3. Copy connection details to environment variables

**Note**: If Redis is not available, the application will fall back to in-memory storage for rate limiting and caching.

## Local Development

### 1. Clone and Install
```bash
git clone <repository-url>
cd Goombas-x-Goated-VIPs
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your database and Redis credentials
```

### 3. Start Development Servers
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 3000
npm run dev:frontend # Frontend on port 5174
```

### 4. Access Application
- Frontend: http://localhost:5174
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

## Replit Deployment

### 1. Replit Configuration
The project includes optimized Replit configuration:

**.replit**:
- Entry point: `src/main.ts`
- Modules: nodejs-20, web, postgresql-16, redis-7
- Environment variables configured
- Proper port mapping (3000 for backend, 5174 for frontend)

**replit.nix**:
- Required packages: Node.js 20, tsx, PostgreSQL, Redis

### 2. Environment Variables in Replit
Set these in Replit's Secrets tab:
```
DATABASE_URL=your-neon-database-url
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
REDIS_HOST=localhost (or external Redis URL)
REDIS_PORT=6379
```

### 3. Deploy to Replit
1. Import project to Replit
2. Configure environment variables
3. Run the application
4. Replit will automatically handle the build and deployment

## Production Deployment

### 1. Build for Production
```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

### 2. Environment Configuration
Update production environment variables:
- Change JWT secrets to strong, unique values
- Use production database URL
- Configure Redis for production
- Set `NODE_ENV=production`
- Configure proper CORS origins

### 3. Recommended Production Setup
- **Database**: Neon PostgreSQL or AWS RDS
- **Cache**: Redis Cloud or AWS ElastiCache
- **Hosting**: Replit, Railway, Vercel, or AWS
- **CDN**: Cloudflare for static assets
- **Monitoring**: Application performance monitoring

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data

### Health Check
- `GET /health` - Application health status
- `GET /api` - API information

## Security Considerations

### 1. Authentication
- JWT tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Secure HTTP-only cookies for refresh tokens
- Automatic token refresh on API calls

### 2. Rate Limiting
- Authentication endpoints: 10 requests per 15 minutes
- Registration: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes

### 3. Input Validation
- All inputs validated with Zod schemas
- Automatic sanitization of string inputs
- SQL injection prevention
- XSS protection

### 4. Password Security
- Bcrypt hashing with 12 rounds
- Minimum password length: 8 characters
- Password change requires current password

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check DATABASE_URL format
DATABASE_URL=postgresql://user:pass@host:port/dbname

# Test connection
psql $DATABASE_URL
```

#### 2. Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# If Redis unavailable, app will use memory store
# Check logs for "Redis error" messages
```

#### 3. Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 20+
```

#### 4. TypeScript Errors
```bash
# Run type checking
npm run typecheck

# Fix common issues
npm run lint --fix
```

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Debugging**: Use browser dev tools for frontend, console.log for backend
3. **Database Inspection**: Use database GUI tools or psql CLI
4. **API Testing**: Use Postman, curl, or browser for API testing

## Migration from v1.0

### Key Changes
1. **Complete rewrite** with domain-driven architecture
2. **New authentication system** - users will need to re-register
3. **Updated API endpoints** - frontend integration required
4. **Enhanced security** - all data is properly validated and sanitized
5. **Improved performance** - Redis caching and optimized queries

### Migration Steps
1. Export user data from v1.0 (if needed)
2. Deploy v2.0 to new environment
3. Update frontend to use new API endpoints
4. Migrate critical data using database scripts
5. Update DNS/routing to point to v2.0

## Support and Maintenance

### Monitoring
- Check `/health` endpoint for application status
- Monitor database and Redis connections
- Watch for error logs in console output

### Updates
- Keep dependencies updated with `npm audit fix`
- Monitor security advisories
- Regular backup of database

### Performance
- Database query optimization
- Redis cache hit rate monitoring
- Frontend bundle size optimization

---

## Quick Start Commands

```bash
# Development
npm install
cp .env.example .env
npm run dev

# Production Build
npm run build
npm start

# Replit Deployment
# Just import to Replit and configure environment variables
```

This deployment guide provides comprehensive instructions for setting up the Goombas x Goated VIPs v2.0 platform in various environments. The application is production-ready with enterprise-grade security and scalability features.