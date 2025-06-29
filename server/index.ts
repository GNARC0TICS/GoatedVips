import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.BOT_PORT || process.env.PORT || '5001');

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000', 'https://*.replit.dev'],
  credentials: true
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock API routes for development
app.get('/api/race-config', (req, res) => {
  res.json({
    isActive: true,
    name: "Daily Race",
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    prize: "$1000"
  });
});

app.get('/api/leaderboard', (req, res) => {
  const { timeframe = 'daily', limit = 10, page = 1 } = req.query;
  
  // Mock leaderboard data
  const mockUsers = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
    id: i + 1,
    username: `Player${i + 1}`,
    totalWager: Math.floor(Math.random() * 100000) + 10000,
    tier: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.floor(Math.random() * 4)],
    rank: i + 1
  }));

  res.json({
    users: mockUsers,
    totalCount: mockUsers.length,
    page: parseInt(page as string),
    totalPages: 1
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  res.json({
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      isEmailVerified: true,
      createdAt: new Date().toISOString()
    },
    token: 'mock-jwt-token'
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    user: {
      id: '1',
      username: req.body.username,
      email: req.body.email,
      role: 'user',
      isEmailVerified: false,
      createdAt: new Date().toISOString()
    },
    token: 'mock-jwt-token'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    isEmailVerified: true,
    createdAt: new Date().toISOString()
  });
});

// User profile routes
app.get('/api/users/:id', (req, res) => {
  res.json({
    id: req.params.id,
    username: 'testuser',
    email: 'test@example.com',
    totalWager: 50000,
    tier: 'Gold',
    level: 'Gold Level 3',
    createdAt: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'Goombas x Goated VIPs API',
    version: '2.0.0',
    endpoints: {
      auth: ['/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/me'],
      leaderboard: ['/api/leaderboard'],
      users: ['/api/users/:id'],
      race: ['/api/race-config']
    }
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});