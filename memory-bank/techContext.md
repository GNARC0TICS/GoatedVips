# GoatedVIPs Technical Context

## Technology Stack

### Frontend
- **Framework**: React with TypeScript
- **Styling**: TailwindCSS with custom components
- **State Management**: React Context API + Custom Hooks
- **Routing**: Wouter (lightweight router)
- **Data Fetching**: TanStack Query (React Query)
- **Animation**: Framer Motion
- **UI Components**: Custom shadcn/ui-inspired components

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: JWT with session cookies
- **WebSockets**: Native WebSocket implementation
- **API Docs**: Documentation in Markdown
- **Validation**: Zod for schema validation

### Database
- **Engine**: PostgreSQL
- **ORM**: Drizzle ORM
- **Schema**: Type-safe schema definitions
- **Migrations**: Managed through Drizzle

### Infrastructure
- **Hosting**: Replit
- **Custom Domains**: 
  - goatedvips.gg (Public)
  - goombas.net (Admin)
- **Environment**: Replit environment variables
- **Logging**: Console logging with structured format

## Development Environment

### Build Tools
- **Frontend**: Vite for development and bundling
- **Backend**: TypeScript with ts-node
- **Package Management**: npm
- **Linting/Formatting**: ESLint + Prettier

### Directory Structure

```
/
├── client/               # Frontend application
│   ├── public/           # Static assets
│   └── src/              # React application source
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and helpers
│       ├── pages/        # Page components
│       └── styles/       # Global styles
├── server/               # Backend application
│   ├── config/           # Server configuration
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── templates/        # Email templates
│   └── utils/            # Utility functions
├── db/                   # Database layer
│   └── schema/           # Drizzle schema definitions
└── shared/               # Shared types and utilities
```

## Key Technical Interfaces

### Authentication System
- JWT token generation and verification
- Session management via HTTP-only cookies
- Role-based authorization rules
- Admin-specific authentication

### Domain Routing System
- Domain detection middleware
- Domain-specific routing and handlers
- Security header configuration by domain
- Cross-origin policy management

### API Sync System
- External API integration
- Data transformation pipeline
- Synchronization scheduling
- Error handling and retry logic

### User Verification System
- Email verification flow
- Account linking validation
- Admin verification queue
- Telegram integration for verification

## Database Schema

### Core Tables
- `users`: User accounts and profiles
- `sessions`: Authentication sessions
- `verification_requests`: Account verification flow
- `api_sync_metadata`: External API sync tracking
- `transformation_logs`: Data transformation tracking

### Relationships
- User to Sessions: One-to-many
- User to Verification: One-to-many
- Admin to Verification: Many-to-many (approvals)

## Security Implementation

### Authentication Security
- Secure password hashing with bcrypt
- JWT with appropriate expiration
- CSRF protection
- Rate limiting on auth endpoints

### Admin Security
- Domain isolation for admin routes
- Environment variable-based credentials
- Enhanced Content Security Policy
- IP restriction capabilities

### Data Security
- Input validation on all endpoints
- SQL injection prevention via Drizzle ORM
- XSS protection through proper output encoding
- CORS configuration based on domain

## Performance Considerations

### Current Optimizations
- Efficient database queries using indexes
- Frontend component optimization (React.memo)
- API response caching where appropriate
- Bundling and code-splitting for frontend

### Planned Enhancements
- Redis caching layer
- Database query optimization
- CDN for static assets
- WebSocket connection pooling
