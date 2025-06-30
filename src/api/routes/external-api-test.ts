
import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';

export function createExternalAPITestRoutes(authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Admin only access for external API testing
  router.use(authMiddleware.required);
  router.use(authMiddleware.requireAdmin);

  // GET /external-api/test - Test external API connectivity
  router.get('/test', async (req: Request, res: Response) => {
    try {
      const apiUrl = process.env.GOATED_API_URL || 'https://api.goated.com';
      const apiToken = process.env.GOATED_API_TOKEN;
      const timeout = 21000; // 21 seconds

      const tests = {
        basicConnectivity: null as any,
        authenticationTest: null as any,
        responseTime: null as any,
        rateLimitCheck: null as any,
        serviceAvailability: null as any,
      };

      // Test 1: Basic Connectivity
      const start = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'GoatedVIPs-TestSuite/2.0',
            'Accept': 'application/json',
          },
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        tests.basicConnectivity = {
          status: response.ok ? 'passed' : 'failed',
          statusCode: response.status,
          statusText: response.statusText,
          responseTime: `${duration}ms`,
          details: response.status === 503 ? 'Service temporarily unavailable' : 'Connection established'
        };

        tests.responseTime = {
          status: duration < 5000 ? 'passed' : 'warning',
          value: duration,
          threshold: 5000,
          message: duration < 5000 ? 'Acceptable response time' : 'Slow response detected'
        };

      } catch (error: any) {
        tests.basicConnectivity = {
          status: 'failed',
          error: error.message,
          errorCode: error.code,
          type: error.name
        };
      }

      // Test 2: Authentication Test (if token available)
      if (apiToken) {
        try {
          const authResponse = await fetch(apiUrl, {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'User-Agent': 'GoatedVIPs-TestSuite/2.0',
              'Accept': 'application/json',
            },
          });

          tests.authenticationTest = {
            status: authResponse.status === 401 ? 'auth_required' : 
                   authResponse.ok ? 'passed' : 'failed',
            statusCode: authResponse.status,
            message: authResponse.status === 401 ? 'Authentication required but token rejected' :
                    authResponse.ok ? 'Authentication successful' : 'Authentication failed'
          };

        } catch (error: any) {
          tests.authenticationTest = {
            status: 'error',
            error: error.message
          };
        }
      } else {
        tests.authenticationTest = {
          status: 'skipped',
          message: 'No API token configured'
        };
      }

      // Test 3: Service Availability Check
      tests.serviceAvailability = {
        status: tests.basicConnectivity?.statusCode === 503 ? 'degraded' : 
               tests.basicConnectivity?.status === 'passed' ? 'available' : 'unavailable',
        message: tests.basicConnectivity?.statusCode === 503 ? 
                'Service under maintenance or overloaded' :
                tests.basicConnectivity?.status === 'passed' ? 
                'Service is available' : 'Service is not responding'
      };

      // Test 4: Rate Limit Check (simplified)
      tests.rateLimitCheck = {
        status: 'info',
        message: 'Rate limiting status depends on API usage patterns',
        recommendation: 'Monitor for 429 status codes in application logs'
      };

      const overallStatus = Object.values(tests).some((test: any) => test?.status === 'failed') ? 'failed' :
                           Object.values(tests).some((test: any) => test?.status === 'degraded') ? 'degraded' : 'passed';

      res.json({
        success: true,
        message: 'External API test completed',
        overallStatus,
        configuration: {
          apiUrl,
          hasToken: !!apiToken,
          timeout: `${timeout}ms`
        },
        tests,
        recommendations: [
          tests.basicConnectivity?.statusCode === 503 ? 'External API is temporarily unavailable. This is likely maintenance.' : null,
          tests.responseTime?.status === 'warning' ? 'Consider implementing request caching for better performance.' : null,
          !apiToken ? 'Configure GOATED_API_TOKEN environment variable for authenticated requests.' : null,
          'Monitor API response patterns and implement circuit breaker for resilience.'
        ].filter(Boolean),
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('External API test error:', error);
      res.status(500).json({
        success: false,
        error: 'External API test failed',
        details: error.message,
        code: 'EXTERNAL_API_TEST_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // GET /external-api/config - Show current external API configuration
  router.get('/config', async (req: Request, res: Response) => {
    try {
      const config = {
        apiUrl: process.env.GOATED_API_URL || 'https://api.goated.com',
        hasToken: !!process.env.GOATED_API_TOKEN,
        tokenPreview: process.env.GOATED_API_TOKEN ? 
          `${process.env.GOATED_API_TOKEN.substring(0, 8)}...` : 'Not configured',
        timeout: 21000,
        userAgent: 'GoatedVIPs-HealthChecker/2.0',
        environment: process.env.NODE_ENV || 'development'
      };

      res.json({
        success: true,
        message: 'External API configuration',
        config,
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('External API config error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve external API configuration',
        details: error.message,
        code: 'EXTERNAL_API_CONFIG_ERROR',
      });
    }
  });

  return router;
}
