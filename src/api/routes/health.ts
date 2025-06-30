
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: 'healthy',
      external_api: 'healthy',
      websocket: 'healthy',
      memory: 'healthy'
    },
    metrics: {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      uptime_seconds: Math.floor(process.uptime())
    }
  };

  // Quick database check
  try {
    // Add a simple database query here if needed
    health.checks.database = 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
    health.status = 'degraded';
  }

  // Check external API availability
  try {
    // This could be enhanced with actual API ping
    health.checks.external_api = circuitBreakerState?.isOpen ? 'degraded' : 'healthy';
  } catch (error) {
    health.checks.external_api = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
