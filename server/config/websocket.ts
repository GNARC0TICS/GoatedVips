/**
 * WebSocket configuration module
 * Centralizes WebSocket server configuration and setup
 * 
 * This module provides a unified approach to creating and managing WebSocket
 * connections across the application. It handles the setup, connection events,
 * and cleanup of WebSocket servers.
 */

import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { log } from '../utils/logger';

// Global WebSocket server instances by path
const wssInstances: Map<string, WebSocketServer> = new Map();

/**
 * Creates a WebSocket server with standardized configurations
 * 
 * @param server - HTTP Server to attach the WebSocket server to
 * @param path - WebSocket path (e.g., '/ws', '/leaderboard')
 * @param connectionHandler - Function to handle new WebSocket connections
 * @returns The created WebSocket server instance
 */
export function createWebSocketServer(
  server: Server,
  path: string,
  connectionHandler: (ws: WebSocket, req: any) => void
): WebSocketServer {
  // Check if a WSS instance already exists for this path
  if (wssInstances.has(path)) {
    const existingWss = wssInstances.get(path);
    log('info', `Using existing WebSocket server for path: ${path}`);
    return existingWss as WebSocketServer;
  }

  // Create a new WebSocket server
  const wss = new WebSocketServer({ server, path });
  
  // Store the instance for potential reuse
  wssInstances.set(path, wss);
  
  log('info', `WebSocket server created for path: ${path}`);

  // Setup connection handling with Vite HMR protection
  wss.on('connection', (ws: WebSocket, req: any) => {
    // Skip Vite HMR connections to avoid interference
    if (req.headers['sec-websocket-protocol']?.includes('vite-hmr')) {
      return;
    }

    log('info', `New WebSocket connection established on ${path}`);
    
    // Set up basic error handling for all connections
    ws.on('error', (error) => {
      log('error', `WebSocket error on ${path}: ${error.message}`);
    });
    
    // Setup WebSocket ping/pong for connection health checking
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });
    
    // Call the provided connection handler
    connectionHandler(ws, req);
  });
  
  // Setup heartbeat mechanism
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const extendedWs = ws as WebSocket & { isAlive?: boolean };
      if (extendedWs.isAlive === false) {
        log('info', `Terminating inactive WebSocket connection on ${path}`);
        return ws.terminate();
      }
      
      extendedWs.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  // Clean up on close
  wss.on('close', () => {
    clearInterval(heartbeatInterval);
    wssInstances.delete(path);
    log('info', `WebSocket server for ${path} closed`);
  });
  
  return wss;
}

/**
 * Broadcasts a message to all connected clients on a specific path
 * 
 * @param path - WebSocket server path
 * @param data - Data to broadcast (will be JSON stringified)
 * @returns Number of clients the message was sent to
 */
export function broadcast(path: string, data: any): number {
  const wss = wssInstances.get(path);
  if (!wss) {
    log('warn', `Attempted to broadcast to non-existent WebSocket server: ${path}`);
    return 0;
  }
  
  let clientCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
      clientCount++;
    }
  });
  
  return clientCount;
}

/**
 * Closes all WebSocket server instances
 * Used during application shutdown
 */
export function closeAllWebSocketServers(): void {
  wssInstances.forEach((wss, path) => {
    log('info', `Closing WebSocket server for path: ${path}`);
    wss.close();
  });
  wssInstances.clear();
}

/**
 * Gets the total count of connected clients across all WebSocket servers
 * 
 * @returns An object with client counts by path and a total
 */
export function getConnectedClientsCount(): { [path: string]: number, total: number } {
  const counts: { [path: string]: number, total: number } = { total: 0 };
  
  wssInstances.forEach((wss, path) => {
    const count = wss.clients.size;
    counts[path] = count;
    counts.total += count;
  });
  
  return counts;
}