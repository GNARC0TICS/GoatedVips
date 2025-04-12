
# GoatedVIPs Development Guide

## Project Structure & Setup

### Environment Setup
- The project runs on Replit's Node.js environment
- Dependencies are managed through package.json
- Replit handles environment variables securely through the Secrets tab

### Development Workflow
1. Use the Replit editor for all development work
2. Test changes using the built-in Run button
3. Use version control through Replit's Git integration

## Secrets Management
- Use Replit's Secrets management tool (found in Tools > Secrets)
- Never store sensitive data in code or commit files containing secrets
- Access secrets via process.env in server code
- Client-side secrets must be exposed through secure API endpoints

Example pattern for secure API keys:
```typescript
// server/config/api.ts
export const API_CONFIG = {
  token: process.env.API_TOKEN,
  baseUrl: process.env.API_BASE_URL
};
```

## Code Safety Guidelines

### Protected Files
The following files should not be modified without team approval:
- .replit
- replit.nix
- package.json (unless additions are guaranteed compatible)

### Safe Development Practices
1. Create feature branches for changes
2. Use Replit's Git integration for version control
3. Get PR reviews before merging changes
4. Test thoroughly using Replit's run configuration

## Data Integrity Rules

### Testing Data
- Use approved seed data from /db/seeds/
- Connect to development API endpoints
- Never create misleading mock data
- Use transformation logs for data validation

### Safe Query Patterns
```typescript
// Example of safe query pattern
const user = await db.query.users.findFirst({
  where: eq(users.goatedId, goatedId),
  columns: {
    id: true,
    username: true,
    profileColor: true
  }
});
```

## Database Management

### Connection Details
- Database is managed through Replit
- Use provided database connection string
- Access via environment variables

### Schema Management
- Use Drizzle ORM for type-safe queries
- Schema defined in /db/schema/
- Migrations handled through Drizzle CLI

## Development Best Practices

### Code Quality
1. Use TypeScript strict mode
2. Follow existing code patterns
3. Document complex functions
4. Use proper error handling

### Testing
1. Use Replit's run button for testing
2. Test across different screen sizes
3. Verify WebSocket connections
4. Check API response handling

## Deployment Process
1. Use Replit's deployment feature
2. Test on staging domain first
3. Verify environment variables
4. Check bundle size and performance

## Maintenance & Updates
- Keep documentation updated
- Monitor API usage and limits
- Review logs for errors
- Update dependencies through Replit

Remember: Always develop and deploy through Replit to maintain consistency and ensure proper environment configuration.
