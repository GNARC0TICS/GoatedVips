# Troubleshooting Guide for GoatedVIPs Application

## Bug: Unable to View Application in Replit Webview
Application appears to be running (logs show server is listening), but requests are blocked when trying to view the app in Replit's webview.

### Diagnosis
After thorough investigation of our application configuration, several potential issues may be causing this problem:

1. **Domain Detection and Routing Issues**:
   - The domain handler middleware is checking for specific domains (`goatedvips.gg`, `goombas.net`)
   - Replit's domain structure doesn't match these patterns, causing potential misrouting

2. **Vite Configuration with Replit Environment**:
   - Vite's HMR server might be configured for specific hosts
   - Our server setup doesn't include special handling for Replit's domain format

3. **Port Binding Conflicts**:
   - Multiple port configurations exist (5000, 5001, 5173) 
   - Replit's environment may have specific port routing requirements

4. **Middleware Handling**:
   - Domain detection middleware sets `isAdminDomain` as optional but some routes require it to be boolean
   - Type mismatch between middleware typings and actual usage

5. **CORS Configuration**:
   - Current CORS settings might not include Replit's domain patterns
   - WebSocket connections might be affected by CORS restrictions

## Solutions

### 1. Update Domain Detection for Replit
```typescript
// In server/middleware/domain-handler.ts
export const domainRedirectMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const hostname = req.hostname;

  // Add support for Replit domains
  req.isAdminDomain = hostname === 'goombas.net' || 
                      hostname.includes('goombas.net') || 
                      (hostname.includes('.replit.app') && hostname.includes('admin'));
  
  req.isPublicDomain = hostname === 'goatedvips.gg' || 
                      hostname.includes('goatedvips.gg') || 
                      hostname.includes('.replit.app');

  next();
};
```

### 2. Fix Type Inconsistencies
```typescript
// In server/middleware/domain-router.ts
declare global {
  namespace Express {
    interface Request {
      domain?: string;
      isAdminDomain: boolean; // Change from optional to required
    }
  }
}
```

### 3. Update CORS Settings for Replit
```typescript
// In server/config/environment.ts
export const CORS_ORIGINS = IS_DEVELOPMENT 
  ? ['http://localhost:5000', 'http://0.0.0.0:5000', 'https://*.replit.app', 'https://*.repl.co'] 
  : (process.env.ALLOWED_ORIGINS?.split(',') || []);
```

### 4. Ensure Proper Port Configuration
```
// In .replit file
[[ports]]
localPort = 5000
externalPort = 80
```

### 5. Add Development Environment Detection for Replit
```typescript
// In server/config/environment.ts
export const IS_REPLIT = process.env.REPL_ID !== undefined;
export const IS_DEVELOPMENT = !IS_PRODUCTION || IS_REPLIT;
```

### 6. Troubleshoot Common Replit-Specific Issues

#### Check if server is binding to the correct host
- Ensure server is binding to `0.0.0.0` not `localhost`
- Verify consistent port usage across configurations

#### Verify workflow execution
- Ensure that all required environment variables are set
- Check that the workflow is running the correct command

#### Update Vite configuration
- Consider adding a Replit-specific server configuration
- Ensure HMR is properly configured for Replit's environment

## Quick Fixes to Try

1. **Force correct host binding**:
   ```javascript
   // In .env
   HOST=0.0.0.0
   ```

2. **Set explicit CORS settings**:
   ```javascript
   app.use(cors({
     origin: '*', // For development only
     credentials: true
   }));
   ```

3. **Ensure middleware type safety**:
   Initialize `isAdminDomain` as false instead of undefined

4. **Check for network request blocking**:
   Inspect browser console for CORS or CSP errors that might block resources

5. **Verify that static files are being served correctly**:
   Ensure the static file paths match the actual file locations

## Monitoring and Debugging

- Inspect server logs for any errors or warnings related to routing or middleware
- Check browser network tab for failed requests or CORS errors
- Add additional logging to domain detection middleware
- Test API endpoints directly using curl to bypass browser restrictions