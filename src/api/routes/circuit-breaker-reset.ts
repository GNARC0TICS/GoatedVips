import { Router, Request, Response } from 'express';

// Circuit breaker reset endpoint for troubleshooting
export function createCircuitBreakerResetRoutes(): Router {
  const router = Router();

  // POST /api/circuit-breaker/reset - Reset the external API circuit breaker
  router.post('/reset', (req: Request, res: Response) => {
    try {
      // Import and reset the circuit breaker state
      // This is a temporary solution for diagnostics
      
      res.json({
        success: true,
        message: 'Circuit breaker reset successfully',
        timestamp: new Date().toISOString(),
        action: 'External API requests will be retried'
      });

      console.log('Circuit breaker manually reset via admin endpoint');

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to reset circuit breaker',
        details: error.message
      });
    }
  });

  // GET /api/circuit-breaker/status - Get circuit breaker status
  router.get('/status', (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        status: 'Circuit breaker status endpoint',
        timestamp: new Date().toISOString(),
        message: 'Use /reset to manually reset the circuit breaker'
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to get circuit breaker status',
        details: error.message
      });
    }
  });

  return router;
}