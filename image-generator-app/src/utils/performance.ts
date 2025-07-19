import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private timers: Map<string, number> = new Map();

  startTimer(name: string, context?: Record<string, any>): void {
    const startTime = performance.now();
    this.timers.set(name, startTime);
    
    logger.debug(`Performance timer started: ${name}`, context);
  }

  endTimer(name: string, context?: Record<string, any>): number {
    const endTime = performance.now();
    const startTime = this.timers.get(name);
    
    if (!startTime) {
      logger.warn(`Performance timer not found: ${name}`);
      return 0;
    }
    
    const duration = endTime - startTime;
    this.timers.delete(name);
    
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      context,
    };
    
    this.metrics.set(name, metric);
    
    logger.debug(`Performance timer ended: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      ...context,
    });
    
    return duration;
  }

  measureFunction<T>(name: string, fn: () => T, context?: Record<string, any>): T {
    this.startTimer(name, context);
    try {
      const result = fn();
      this.endTimer(name, context);
      return result;
    } catch (error) {
      this.endTimer(name, { ...context, error: true });
      throw error;
    }
  }

  async measureAsyncFunction<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    this.startTimer(name, context);
    try {
      const result = await fn();
      this.endTimer(name, context);
      return result;
    } catch (error) {
      this.endTimer(name, { ...context, error: true });
      throw error;
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  logWebVitals(): void {
    // Core Web Vitals monitoring
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Largest Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            logger.info('Largest Contentful Paint', {
              value: entry.startTime,
              metric: 'LCP',
            });
          }
        }
      });
      
      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {
        // Observer not supported
      }
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            logger.info('First Input Delay', {
              value: (entry as any).processingStart - entry.startTime,
              metric: 'FID',
            });
          }
        }
      });
      
      try {
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (error) {
        // Observer not supported
      }
    }
  }
}

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = new PerformanceMonitor();
  
  return {
    startTimer: monitor.startTimer.bind(monitor),
    endTimer: monitor.endTimer.bind(monitor),
    measureFunction: monitor.measureFunction.bind(monitor),
    measureAsyncFunction: monitor.measureAsyncFunction.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    getMetric: monitor.getMetric.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
  };
}

export const performanceMonitor = new PerformanceMonitor();