import { Router, Request, Response } from 'express';
import { AuthMiddleware } from '../middleware/auth';

export function createExternalAPIDiagnosticsRoutes(authMiddleware: AuthMiddleware): Router {
  const router = Router();

  // Admin only access for external API diagnostics
  router.use(authMiddleware.required);
  router.use(authMiddleware.requireAdmin);

  // GET /external-api-diagnostics/full-test - Comprehensive external API testing
  router.get('/full-test', async (req: Request, res: Response) => {
    try {
      const apiUrl = process.env.GOATED_API_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
      const apiToken = process.env.GOATED_API_TOKEN;
      
      const diagnostics = {
        configuration: {
          hasUrl: !!apiUrl,
          hasToken: !!apiToken,
          urlPreview: apiUrl?.substring(0, 60) + '...',
          tokenValid: apiToken ? apiToken.length > 20 : false,
          environment: process.env.NODE_ENV || 'development'
        },
        connectivity: null as any,
        authentication: null as any,
        dataFormat: null as any,
        performance: null as any,
        errors: [] as string[]
      };

      console.log('Starting comprehensive external API diagnostics...');

      // Test 1: Basic connectivity (without auth)
      try {
        const start = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const basicResponse = await fetch(apiUrl, {
          method: 'HEAD',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - start;

        diagnostics.connectivity = {
          status: 'success',
          httpStatus: basicResponse.status,
          responseTime: `${duration}ms`,
          headers: Object.fromEntries(basicResponse.headers.entries())
        };

      } catch (error: any) {
        diagnostics.connectivity = {
          status: 'failed',
          error: error.message,
          type: error.name
        };
        diagnostics.errors.push(`Connectivity: ${error.message}`);
      }

      // Test 2: Authentication test (with token)
      if (apiToken) {
        try {
          const start = Date.now();
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000);

          const authResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
              'User-Agent': 'GoatedVIPs-Diagnostics/2.0',
              'Accept': 'application/json',
            },
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          const duration = Date.now() - start;

          if (authResponse.ok) {
            const responseText = await authResponse.text();
            let parsedData = null;
            
            try {
              parsedData = JSON.parse(responseText);
            } catch (parseError) {
              parsedData = { rawResponse: responseText.substring(0, 500) };
            }

            diagnostics.authentication = {
              status: 'success',
              httpStatus: authResponse.status,
              responseTime: `${duration}ms`,
              contentType: authResponse.headers.get('content-type'),
              dataSize: responseText.length
            };

            diagnostics.dataFormat = {
              isJson: authResponse.headers.get('content-type')?.includes('application/json'),
              hasData: !!parsedData,
              isArray: Array.isArray(parsedData),
              hasDataProperty: parsedData && typeof parsedData === 'object' && 'data' in parsedData,
              structure: typeof parsedData,
              sampleKeys: parsedData && typeof parsedData === 'object' ? Object.keys(parsedData).slice(0, 10) : [],
              dataCount: Array.isArray(parsedData) ? parsedData.length : 
                        (parsedData?.data && Array.isArray(parsedData.data)) ? parsedData.data.length : 0
            };

          } else {
            const errorText = await authResponse.text();
            diagnostics.authentication = {
              status: 'failed',
              httpStatus: authResponse.status,
              statusText: authResponse.statusText,
              responseTime: `${duration}ms`,
              errorBody: errorText.substring(0, 500)
            };
            diagnostics.errors.push(`Authentication: HTTP ${authResponse.status} - ${authResponse.statusText}`);
          }

        } catch (error: any) {
          diagnostics.authentication = {
            status: 'failed',
            error: error.message,
            type: error.name
          };
          diagnostics.errors.push(`Authentication: ${error.message}`);
        }
      } else {
        diagnostics.authentication = {
          status: 'skipped',
          reason: 'No API token provided'
        };
        diagnostics.errors.push('Authentication: No API token configured');
      }

      // Test 3: Performance analysis
      if (diagnostics.authentication?.status === 'success') {
        try {
          const performanceTests = [];
          
          for (let i = 0; i < 3; i++) {
            const start = Date.now();
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            try {
              const response = await fetch(apiUrl, {
                headers: {
                  'Authorization': `Bearer ${apiToken}`,
                  'Content-Type': 'application/json',
                  'User-Agent': 'GoatedVIPs-Performance/2.0',
                },
                signal: controller.signal,
              });

              clearTimeout(timeoutId);
              const duration = Date.now() - start;
              
              performanceTests.push({
                attempt: i + 1,
                duration: `${duration}ms`,
                status: response.status,
                success: response.ok
              });

            } catch (error: any) {
              clearTimeout(timeoutId);
              performanceTests.push({
                attempt: i + 1,
                error: error.message,
                success: false
              });
            }

            // Wait between tests
            if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
          }

          diagnostics.performance = {
            tests: performanceTests,
            averageTime: performanceTests
              .filter(t => t.success && t.duration)
              .reduce((acc, t) => acc + parseInt(t.duration), 0) / performanceTests.filter(t => t.success).length || 0,
            successRate: (performanceTests.filter(t => t.success).length / performanceTests.length) * 100
          };

        } catch (error: any) {
          diagnostics.performance = {
            status: 'failed',
            error: error.message
          };
        }
      }

      // Generate recommendations
      const recommendations = [];
      
      if (diagnostics.connectivity?.status === 'failed') {
        recommendations.push('Check network connectivity and firewall settings');
      }
      
      if (diagnostics.authentication?.status === 'failed') {
        if (diagnostics.authentication.httpStatus === 401) {
          recommendations.push('API token may be expired or invalid - request new credentials');
        } else if (diagnostics.authentication.httpStatus === 403) {
          recommendations.push('API token lacks required permissions');
        } else if (diagnostics.authentication.httpStatus === 503) {
          recommendations.push('External API service is temporarily unavailable');
        }
      }
      
      if (diagnostics.performance?.successRate < 80) {
        recommendations.push('Consider implementing retry logic and caching');
      }

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        diagnostics,
        recommendations,
        summary: {
          overallStatus: diagnostics.errors.length === 0 ? 'healthy' : 'issues_detected',
          criticalIssues: diagnostics.errors.length,
          canFetchData: diagnostics.authentication?.status === 'success' && diagnostics.dataFormat?.hasData
        }
      });

    } catch (error: any) {
      console.error('External API diagnostics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to run external API diagnostics',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /external-api-diagnostics/quick-test - Quick connectivity test
  router.get('/quick-test', async (req: Request, res: Response) => {
    try {
      const apiUrl = process.env.GOATED_API_URL || 'https://apis.goated.com/user/affiliate/referral-leaderboard/2RW440E';
      const apiToken = process.env.GOATED_API_TOKEN;

      if (!apiToken) {
        return res.json({
          success: false,
          error: 'No API token configured',
          timestamp: new Date().toISOString()
        });
      }

      const start = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - start;

      res.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responseTime: `${duration}ms`,
        timestamp: new Date().toISOString(),
        canFetchData: response.ok
      });

    } catch (error: any) {
      res.json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        canFetchData: false
      });
    }
  });

  return router;
}