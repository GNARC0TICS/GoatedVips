import { ICacheService } from '../cache/ICacheService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

// Health status types
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface OverallHealth {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: Record<string, HealthCheck>;
  metadata?: Record<string, any>;
}

// Individual health check interface
export interface IHealthChecker {
  name: string;
  check(): Promise<HealthCheck>;
}

// Database health checker
export class DatabaseHealthChecker implements IHealthChecker {
  name = 'database';
  
  constructor(private userRepository: IUserRepository) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Simple query to test database connectivity
      await this.userRepository.getStats();
      
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status: duration < 1000 ? 'healthy' : 'degraded',
        message: duration < 1000 ? 'Database responding normally' : 'Database responding slowly',
        duration,
        metadata: {
          responseTime: `${duration}ms`,
          threshold: '1000ms',
        },
      };
    } catch (error: any) {
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        message: `Database connection failed: ${error.message}`,
        duration,
        metadata: {
          error: error.name,
          code: error.code,
        },
      };
    }
  }
}

// Cache health checker
export class CacheHealthChecker implements IHealthChecker {
  name = 'cache';
  
  constructor(private cacheService: ICacheService) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      // Test cache connectivity with ping
      const result = await this.cacheService.ping();
      const duration = Date.now() - start;
      
      if (result === 'PONG') {
        return {
          name: this.name,
          status: duration < 100 ? 'healthy' : 'degraded',
          message: duration < 100 ? 'Cache responding normally' : 'Cache responding slowly',
          duration,
          metadata: {
            responseTime: `${duration}ms`,
            threshold: '100ms',
          },
        };
      } else {
        return {
          name: this.name,
          status: 'unhealthy',
          message: 'Cache ping returned unexpected result',
          duration,
          metadata: {
            response: result,
          },
        };
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        message: `Cache connection failed: ${error.message}`,
        duration,
        metadata: {
          error: error.name,
        },
      };
    }
  }
}

// Memory health checker
export class MemoryHealthChecker implements IHealthChecker {
  name = 'memory';
  
  constructor(
    private memoryThresholds = {
      warning: 0.8,  // 80%
      critical: 0.9, // 90%
    }
  ) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapTotal;
      const usedMemory = memUsage.heapUsed;
      const usage = usedMemory / totalMemory;
      
      let status: HealthStatus = 'healthy';
      let message = 'Memory usage is normal';
      
      if (usage >= this.memoryThresholds.critical) {
        status = 'unhealthy';
        message = 'Memory usage is critically high';
      } else if (usage >= this.memoryThresholds.warning) {
        status = 'degraded';
        message = 'Memory usage is elevated';
      }
      
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status,
        message,
        duration,
        metadata: {
          usagePercent: `${(usage * 100).toFixed(1)}%`,
          heapUsed: `${Math.round(usedMemory / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(totalMemory / 1024 / 1024)}MB`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          thresholds: this.memoryThresholds,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        message: `Memory check failed: ${error.message}`,
        duration,
      };
    }
  }
}

// External API health checker
export class ExternalAPIHealthChecker implements IHealthChecker {
  name = 'external_api';
  
  constructor(
    private apiUrl: string,
    private apiToken?: string,
    private timeout = 21000 // Increased timeout for external API
  ) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const headers: Record<string, string> = {
        'User-Agent': 'GoatedVIPs-HealthChecker/2.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
      }
      
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers,
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - start;
      
      // Handle different response scenarios
      if (response.status === 503) {
        return {
          name: this.name,
          status: 'degraded',
          message: 'External API service temporarily unavailable (503)',
          duration,
          metadata: {
            url: this.apiUrl,
            statusCode: response.status,
            statusText: response.statusText,
            responseTime: `${duration}ms`,
            note: 'Service may be under maintenance',
          },
        };
      }
      
      if (response.ok) {
        return {
          name: this.name,
          status: duration < 5000 ? 'healthy' : 'degraded',
          message: duration < 5000 ? 'External API responding normally' : 'External API responding slowly',
          duration,
          metadata: {
            url: this.apiUrl,
            statusCode: response.status,
            responseTime: `${duration}ms`,
            threshold: '5000ms',
          },
        };
      } else if (response.status >= 400 && response.status < 500) {
        return {
          name: this.name,
          status: 'degraded',
          message: `External API client error (${response.status}): Possible authentication or rate limiting`,
          duration,
          metadata: {
            url: this.apiUrl,
            statusCode: response.status,
            statusText: response.statusText,
            category: 'client_error',
          },
        };
      } else {
        return {
          name: this.name,
          status: 'unhealthy',
          message: `External API server error: ${response.status}`,
          duration,
          metadata: {
            url: this.apiUrl,
            statusCode: response.status,
            statusText: response.statusText,
            category: 'server_error',
          },
        };
      }
    } catch (error: any) {
      const duration = Date.now() - start;
      
      // Enhanced error categorization
      let errorCategory = 'unknown';
      let statusMessage = 'External API check failed';
      
      if (error.name === 'AbortError') {
        errorCategory = 'timeout';
        statusMessage = `External API timeout after ${this.timeout}ms`;
      } else if (error.code === 'ECONNREFUSED') {
        errorCategory = 'connection_refused';
        statusMessage = 'External API connection refused';
      } else if (error.code === 'ENOTFOUND') {
        errorCategory = 'dns_resolution';
        statusMessage = 'External API DNS resolution failed';
      } else if (error.code === 'ECONNRESET') {
        errorCategory = 'connection_reset';
        statusMessage = 'External API connection reset';
      }
      
      return {
        name: this.name,
        status: 'unhealthy',
        message: `${statusMessage}: ${error.message}`,
        duration,
        metadata: {
          url: this.apiUrl,
          error: error.name,
          errorCode: error.code,
          errorCategory,
          timeout: this.timeout,
        },
      };
    }
  }
}

// Disk space health checker
export class DiskSpaceHealthChecker implements IHealthChecker {
  name = 'disk_space';
  
  constructor(
    private thresholds = {
      warning: 0.8,  // 80%
      critical: 0.9, // 90%
    }
  ) {}
  
  async check(): Promise<HealthCheck> {
    const start = Date.now();
    
    try {
      const fs = await import('fs/promises');
      const stats = await fs.statfs('.');
      
      const total = stats.blocks * stats.bsize;
      const free = stats.bavail * stats.bsize;
      const used = total - free;
      const usage = used / total;
      
      let status: HealthStatus = 'healthy';
      let message = 'Disk space usage is normal';
      
      if (usage >= this.thresholds.critical) {
        status = 'unhealthy';
        message = 'Disk space usage is critically high';
      } else if (usage >= this.thresholds.warning) {
        status = 'degraded';
        message = 'Disk space usage is elevated';
      }
      
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status,
        message,
        duration,
        metadata: {
          usagePercent: `${(usage * 100).toFixed(1)}%`,
          totalGB: `${(total / 1024 / 1024 / 1024).toFixed(1)}GB`,
          usedGB: `${(used / 1024 / 1024 / 1024).toFixed(1)}GB`,
          freeGB: `${(free / 1024 / 1024 / 1024).toFixed(1)}GB`,
          thresholds: this.thresholds,
        },
      };
    } catch (error: any) {
      const duration = Date.now() - start;
      
      return {
        name: this.name,
        status: 'unhealthy',
        message: `Disk space check failed: ${error.message}`,
        duration,
      };
    }
  }
}

// Main health checker orchestrator
export class HealthChecker {
  private checkers: Map<string, IHealthChecker> = new Map();
  private startTime = Date.now();
  
  constructor() {}
  
  // Register a health checker
  register(checker: IHealthChecker): void {
    this.checkers.set(checker.name, checker);
  }
  
  // Unregister a health checker
  unregister(name: string): void {
    this.checkers.delete(name);
  }
  
  // Run all health checks
  async checkHealth(includeChecks: string[] = []): Promise<OverallHealth> {
    const checksToRun = includeChecks.length > 0 
      ? Array.from(this.checkers.entries()).filter(([name]) => includeChecks.includes(name))
      : Array.from(this.checkers.entries());
    
    // Run all checks in parallel
    const checkPromises = checksToRun.map(async ([name, checker]) => {
      try {
        const result = await checker.check();
        return [name, result] as [string, HealthCheck];
      } catch (error: any) {
        return [name, {
          name,
          status: 'unhealthy' as HealthStatus,
          message: `Health check failed: ${error.message}`,
          metadata: { error: error.name },
        }] as [string, HealthCheck];
      }
    });
    
    const checkResults = await Promise.all(checkPromises);
    const checks = Object.fromEntries(checkResults);
    
    // Determine overall health status
    const statuses = Object.values(checks).map(check => check.status);
    let overallStatus: HealthStatus = 'healthy';
    
    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metadata: {
        totalChecks: Object.keys(checks).length,
        healthyChecks: statuses.filter(s => s === 'healthy').length,
        degradedChecks: statuses.filter(s => s === 'degraded').length,
        unhealthyChecks: statuses.filter(s => s === 'unhealthy').length,
      },
    };
  }
  
  // Get a specific health check
  async checkSpecific(name: string): Promise<HealthCheck | null> {
    const checker = this.checkers.get(name);
    if (!checker) {
      return null;
    }
    
    return await checker.check();
  }
  
  // Get list of available checks
  getAvailableChecks(): string[] {
    return Array.from(this.checkers.keys());
  }
  
  // Express middleware for health endpoint
  middleware() {
    return async (req: any, res: any) => {
      try {
        const includeChecks = req.query.checks 
          ? req.query.checks.split(',').map((s: string) => s.trim())
          : [];
        
        const health = await this.checkHealth(includeChecks);
        
        const statusCode = health.status === 'healthy' ? 200 
          : health.status === 'degraded' ? 200 
          : 503;
        
        res.status(statusCode).json(health);
      } catch (error: any) {
        res.status(500).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Health check system failure',
          message: error.message,
        });
      }
    };
  }
}

// Factory function to create a configured health checker
export function createHealthChecker(config: {
  userRepository?: IUserRepository;
  cacheService?: ICacheService;
  externalAPIUrl?: string;
  externalAPIToken?: string;
}): HealthChecker {
  const healthChecker = new HealthChecker();
  
  // Register database health checker
  if (config.userRepository) {
    healthChecker.register(new DatabaseHealthChecker(config.userRepository));
  }
  
  // Register cache health checker
  if (config.cacheService) {
    healthChecker.register(new CacheHealthChecker(config.cacheService));
  }
  
  // Register memory health checker
  healthChecker.register(new MemoryHealthChecker());
  
  // Register disk space health checker
  healthChecker.register(new DiskSpaceHealthChecker());
  
  // Register external API health checker
  if (config.externalAPIUrl) {
    healthChecker.register(new ExternalAPIHealthChecker(
      config.externalAPIUrl,
      config.externalAPIToken
    ));
  }
  
  return healthChecker;
}