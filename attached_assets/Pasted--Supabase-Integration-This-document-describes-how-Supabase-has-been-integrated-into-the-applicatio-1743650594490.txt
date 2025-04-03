# Supabase Integration

This document describes how Supabase has been integrated into the application for authentication and database storage.

## Authentication Flow

The application uses Supabase Auth for user authentication. The flow works as follows:

1. Client-side: Users sign up or sign in through Supabase Auth
2. Supabase returns a JWT token on successful authentication
3. This token is automatically included in all subsequent API requests
4. Server-side: The middleware verifies the JWT token and attaches the user to the request

## API Endpoints

The following authentication-related API endpoints have been implemented:

- `/api/supabase-config` - Returns the Supabase URL and anon key for client-side initialization
- `/api/user` - Returns information about the currently authenticated user (requires auth)

## Authentication Middleware

The application uses a custom middleware for validating Supabase JWT tokens:

- `supabaseAuthMiddleware` - Verifies Supabase JWT tokens and attaches user info to the request
- `requireAuth` - Ensures the user is authenticated before accessing protected endpoints
- `requireAdmin` - Ensures the user is an admin before accessing admin-only endpoints

## Testing Authentication

A test page has been created at `/auth-test.html` which demonstrates:

1. User sign up
2. User sign in
3. Session management
4. API calls with authentication

## Environment Variables

The following environment variables are required for Supabase integration:

- `SUPABASE_URL` - The URL of your Supabase project
- `SUPABASE_ANON_KEY` - The anonymous key for client-side operations
- `SUPABASE_SERVICE_KEY` - The service key for admin/server operations

## Implementation Files

The Supabase integration is implemented in the following files:

- `db/supabase.ts` - Supabase client setup and database connection
- `server/middleware/supabase-auth.ts` - Authentication middleware for Express
- `server/routes.ts` - API endpoints for authentication
- `client/auth-test.html` - Test page for authentication flow
- `types/express.d.ts` - Type definitions for Express with Supabase user

## Next Steps

1. Implement user profile management
2. Add social authentication providers
3. Create protected routes in the frontend
4. Implement role-based access control