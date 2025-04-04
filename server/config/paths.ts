/**
 * Centralized path configuration
 * Provides consistent path resolution across the application
 * 
 * This module ensures paths are correctly resolved in both development
 * and production environments, regardless of how the application is started.
 */

import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules compatible dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root path is two levels up from this file (server/config)
const rootDir = path.resolve(__dirname, '..', '..');

export const PATHS = {
  // Project structure
  root: rootDir,

  // Client paths
  clientSrc: path.resolve(rootDir, 'client', 'src'),
  clientBuild: path.resolve(rootDir, 'dist', 'public'),
  clientIndex: path.resolve(rootDir, 'client', 'index.html'),
  adminIndex: path.resolve(rootDir, 'client', 'admin.html'), // Added admin HTML path

  // Server paths
  serverSrc: path.resolve(rootDir, 'server'),

  // Database paths
  dbSrc: path.resolve(rootDir, 'db'),

  // Utility function to resolve paths relative to root
  resolve: (...segments: string[]) => path.resolve(rootDir, ...segments),
};