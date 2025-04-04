#!/usr/bin/env node

/**
 * Enhanced Replit-specific startup script that handles Vite host validation issues
 * without modifying core configuration files.
 * 
 * This script:
 * 1. Sets environment variables needed for Vite in Replit
 * 2. Patches CORS allowed origins for Replit domains
 * 3. Enables safe connections from any host in the Replit environment
 * 4. Configures HMR (Hot Module Replacement) to work correctly
 */

// Detect Replit environment
const isReplit = process.env.REPL_ID && process.env.REPL_OWNER;
const replitDomain = process.env.REPLIT_DOMAIN || '';
const replitSlug = process.env.REPL_SLUG || '';

// Replit configuration
if (isReplit) {
  console.log('🚀 Running in Replit environment');
  
  // Core Vite server settings for Replit
  process.env.VITE_DEV_SERVER_HOSTNAME = '0.0.0.0';           // Listen on all interfaces
  process.env.VITE_DEV_SERVER_PORT = '5173';                  // Standard Vite port
  process.env.VITE_DEV_SERVER_STRICTPORT = 'false';           // Don't fail if port is in use
  process.env.VITE_DEV_SERVER_HMR_CLIENT_PORT = '443';        // Use HTTPS port for HMR
  process.env.VITE_ALLOW_EXTERNAL = 'true';                   // Accept external connections
  
  // HMR host configuration
  if (replitDomain) {
    process.env.VITE_DEV_SERVER_HMR_HOST = replitDomain;      // Use Replit domain for HMR
    console.log(`📡 Setting HMR host to: ${replitDomain}`);
    
    // Add all possible Replit domain formats to allowed origins
    const newOrigins = [
      `https://${replitDomain}`,
      `https://${replitSlug}.${process.env.REPL_OWNER}.repl.co`,
      `https://${replitSlug}--${process.env.REPL_OWNER}.repl.co`
    ];
    
    // Update ALLOWED_ORIGINS
    const existingOrigins = process.env.ALLOWED_ORIGINS || '';
    const originsSet = new Set(existingOrigins.split(',').filter(Boolean));
    
    newOrigins.forEach(origin => originsSet.add(origin));
    process.env.ALLOWED_ORIGINS = Array.from(originsSet).join(',');
    
    console.log(`🔓 Added Replit domains to ALLOWED_ORIGINS`);
  }
  
  // Session and cookie security settings for Replit
  process.env.SESSION_SECURE = 'true';                        // Use secure cookies
  process.env.SESSION_SAME_SITE = 'none';                     // Allow cross-site cookies
  process.env.SESSION_DOMAIN = '';                            // Don't restrict to specific domain
}

// Display configuration
console.log('\n📋 Server Configuration:');
console.log(`   Server port: ${process.env.API_PORT || 5000}`);
console.log(`   Bot port: ${process.env.BOT_PORT || 5001}`);
console.log(`   Vite port: ${process.env.VITE_DEV_SERVER_PORT}`);
console.log(`   Allowed origins: ${process.env.ALLOWED_ORIGINS}`);
console.log(`   Node environment: ${process.env.NODE_ENV || 'development'}\n`);

// Launch the application using tsx
console.log('🚀 Launching application...');
require('tsx/dist/cli.js')('./server/index.ts');