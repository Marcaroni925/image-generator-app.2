import { logger } from './logger';

interface HealthCheckResult {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  timestamp: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckResult[];
  timestamp: number;
}

class HealthMonitor {
  private healthChecks: Map<string, () => Promise<HealthCheckResult>> = new Map();
  private lastHealthCheck: SystemHealth | null = null;
  private healthCheckInterval: number | null = null;

  constructor() {
    this.initializeDefaultChecks();
  }

  private initializeDefaultChecks(): void {
    this.addHealthCheck('memory', this.checkMemoryUsage);
    this.addHealthCheck('storage', this.checkStorageSpace);
    this.addHealthCheck('network', this.checkNetworkConnectivity);
  }

  addHealthCheck(name: string, checkFn: () => Promise<HealthCheckResult>): void {
    this.healthChecks.set(name, checkFn);
    logger.debug(`Health check registered: ${name}`);
  }

  removeHealthCheck(name: string): void {
    this.healthChecks.delete(name);
    logger.debug(`Health check removed: ${name}`);
  }

  async runHealthChecks(): Promise<SystemHealth> {
    const checks: HealthCheckResult[] = [];
    
    for (const [name, checkFn] of this.healthChecks) {
      try {
        const startTime = performance.now();
        const result = await checkFn();
        const endTime = performance.now();
        
        checks.push({
          ...result,
          latency: endTime - startTime,
          timestamp: Date.now(),
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Health check failed: ${name}`, error as Error);
        checks.push({
          name,
          status: 'unhealthy',
          message: errorMessage,
          timestamp: Date.now(),
        });
      }
    }

    const overall = this.calculateOverallHealth(checks);
    const systemHealth: SystemHealth = {
      overall,
      checks,
      timestamp: Date.now(),
    };

    this.lastHealthCheck = systemHealth;
    
    logger.info('Health check completed', {
      overall,
      unhealthy: checks.filter(c => c.status === 'unhealthy').length,
      degraded: checks.filter(c => c.status === 'degraded').length,
      healthy: checks.filter(c => c.status === 'healthy').length,
    });

    return systemHealth;
  }

  private calculateOverallHealth(checks: HealthCheckResult[]): 'healthy' | 'degraded' | 'unhealthy' {
    const unhealthyCount = checks.filter(c => c.status === 'unhealthy').length;
    const degradedCount = checks.filter(c => c.status === 'degraded').length;

    if (unhealthyCount > 0) {
      return 'unhealthy';
    } else if (degradedCount > 0) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  startPeriodicHealthChecks(intervalMs: number = 300000): void { // 5 minutes default
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = window.setInterval(() => {
      this.runHealthChecks().catch(error => {
        logger.error('Periodic health check failed', error);
      });
    }, intervalMs);

    logger.info('Periodic health checks started', { intervalMs });
  }

  stopPeriodicHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      logger.info('Periodic health checks stopped');
    }
  }

  getLastHealthCheck(): SystemHealth | null {
    return this.lastHealthCheck;
  }

  // Default health checks
  private checkMemoryUsage = async (): Promise<HealthCheckResult> => {
    const result: HealthCheckResult = {
      name: 'memory',
      status: 'healthy',
      timestamp: Date.now(),
    };

    if ('memory' in performance && 'usedJSHeapSize' in (performance as any).memory) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      
      const usagePercent = (usedMB / limitMB) * 100;
      
      if (usagePercent > 90) {
        result.status = 'unhealthy';
        result.message = `Memory usage critical: ${usagePercent.toFixed(1)}%`;
      } else if (usagePercent > 75) {
        result.status = 'degraded';
        result.message = `Memory usage high: ${usagePercent.toFixed(1)}%`;
      } else {
        result.message = `Memory usage normal: ${usagePercent.toFixed(1)}%`;
      }
    } else {
      result.message = 'Memory info not available';
    }

    return result;
  };

  private checkStorageSpace = async (): Promise<HealthCheckResult> => {
    const result: HealthCheckResult = {
      name: 'storage',
      status: 'healthy',
      timestamp: Date.now(),
    };

    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.quota && estimate.usage) {
          const usagePercent = (estimate.usage / estimate.quota) * 100;
          
          if (usagePercent > 90) {
            result.status = 'unhealthy';
            result.message = `Storage usage critical: ${usagePercent.toFixed(1)}%`;
          } else if (usagePercent > 75) {
            result.status = 'degraded';
            result.message = `Storage usage high: ${usagePercent.toFixed(1)}%`;
          } else {
            result.message = `Storage usage normal: ${usagePercent.toFixed(1)}%`;
          }
        } else {
          result.message = 'Storage info not available';
        }
      } catch (error) {
        result.status = 'degraded';
        result.message = 'Storage check failed';
      }
    } else {
      result.message = 'Storage API not supported';
    }

    return result;
  };

  private checkNetworkConnectivity = async (): Promise<HealthCheckResult> => {
    const result: HealthCheckResult = {
      name: 'network',
      status: 'healthy',
      timestamp: Date.now(),
    };

    if ('onLine' in navigator) {
      if (!navigator.onLine) {
        result.status = 'unhealthy';
        result.message = 'Network offline';
        return result;
      }
    }

    // Test network connectivity with a simple request
    try {
      const response = await fetch('/health', {
        method: 'HEAD',
        cache: 'no-cache',
      });
      
      if (response.ok) {
        result.message = 'Network connectivity good';
      } else {
        result.status = 'degraded';
        result.message = `Network issues: ${response.status}`;
      }
    } catch (error) {
      result.status = 'degraded';
      result.message = 'Network connectivity test failed';
    }

    return result;
  };
}

export const healthMonitor = new HealthMonitor();