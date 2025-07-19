interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  timestamp?: number;
  [key: string]: any;
}

interface ErrorTrackingConfig {
  sentryDsn?: string;
  logRocketAppId?: string;
  customEndpoint?: string;
  enableConsoleLogging?: boolean;
  enableInDevelopment?: boolean;
}

interface ErrorReport {
  message: string;
  stack?: string;
  level: 'error' | 'warning' | 'info';
  context?: ErrorContext;
  fingerprint?: string[];
  tags?: Record<string, string>;
  user?: {
    id?: string;
    email?: string;
    username?: string;
  };
}

class ErrorTrackingService {
  private config: ErrorTrackingConfig;
  private isEnabled: boolean;
  private sessionId: string;

  constructor(config: ErrorTrackingConfig = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableInDevelopment: false,
      ...config,
    };
    
    this.isEnabled = this.shouldEnable();
    this.sessionId = this.generateSessionId();
    
    if (this.isEnabled) {
      this.initialize();
    }
  }

  private shouldEnable(): boolean {
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment && !this.config.enableInDevelopment) {
      return false;
    }
    
    return Boolean(
      this.config.sentryDsn ||
      this.config.logRocketAppId ||
      this.config.customEndpoint ||
      this.config.enableConsoleLogging
    );
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  private initialize(): void {
    // Initialize Sentry if configured
    if (this.config.sentryDsn && typeof window !== 'undefined') {
      this.initializeSentry();
    }
    
    // Initialize LogRocket if configured
    if (this.config.logRocketAppId && typeof window !== 'undefined') {
      this.initializeLogRocket();
    }
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  private initializeSentry(): void {
    // This would be implemented with @sentry/browser
    // For now, we'll just log that it would be initialized
    console.log('Sentry would be initialized with DSN:', this.config.sentryDsn);
  }

  private initializeLogRocket(): void {
    // This would be implemented with logrocket
    // For now, we'll just log that it would be initialized
    console.log('LogRocket would be initialized with App ID:', this.config.logRocketAppId);
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'uncaught_error',
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        {
          type: 'unhandled_promise_rejection',
        }
      );
    });
  }

  captureError(error: Error, context?: ErrorContext): void {
    if (!this.isEnabled) return;

    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      level: 'error',
      context: {
        sessionId: this.sessionId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: Date.now(),
        ...context,
      },
    };

    this.sendReport(report);
  }

  captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info', context?: ErrorContext): void {
    if (!this.isEnabled) return;

    const report: ErrorReport = {
      message,
      level,
      context: {
        sessionId: this.sessionId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: Date.now(),
        ...context,
      },
    };

    this.sendReport(report);
  }

  setUser(user: { id?: string; email?: string; username?: string }): void {
    if (!this.isEnabled) return;
    
    // In a real implementation, this would set user context in Sentry/LogRocket
    console.log('User context set:', user);
  }

  setContext(key: string, value: any): void {
    if (!this.isEnabled) return;
    
    // In a real implementation, this would set additional context
    console.log('Context set:', { [key]: value });
  }

  addBreadcrumb(message: string, category?: string, data?: any): void {
    if (!this.isEnabled) return;
    
    // In a real implementation, this would add breadcrumbs to the error tracking service
    console.log('Breadcrumb added:', { message, category, data, timestamp: Date.now() });
  }

  private async sendReport(report: ErrorReport): Promise<void> {
    // Console logging for development
    if (this.config.enableConsoleLogging) {
      console.error('Error tracked:', report);
    }

    // Send to Sentry (would be implemented with Sentry SDK)
    if (this.config.sentryDsn) {
      await this.sendToSentry(report);
    }

    // Send to LogRocket (would be implemented with LogRocket SDK)
    if (this.config.logRocketAppId) {
      await this.sendToLogRocket(report);
    }

    // Send to custom endpoint
    if (this.config.customEndpoint) {
      await this.sendToCustomEndpoint(report);
    }
  }

  private async sendToSentry(report: ErrorReport): Promise<void> {
    // Implementation would use Sentry SDK
    // For now, simulate the API call
    console.log('Would send to Sentry:', report);
  }

  private async sendToLogRocket(report: ErrorReport): Promise<void> {
    // Implementation would use LogRocket SDK
    // For now, simulate the API call
    console.log('Would send to LogRocket:', report);
  }

  private async sendToCustomEndpoint(report: ErrorReport): Promise<void> {
    try {
      const response = await fetch(this.config.customEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...report,
          projectId: import.meta.env.VITE_PROJECT_ID,
          environment: import.meta.env.VITE_ENVIRONMENT || 'production',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Avoid infinite loops by not using the error tracking service here
      console.error('Failed to send error report to custom endpoint:', error);
    }
  }

  // Method to manually flush any pending reports
  async flush(): Promise<void> {
    // In a real implementation, this would flush pending reports
    console.log('Error tracking service flushed');
  }
}

// Create and export a singleton instance
const errorTrackingConfig: ErrorTrackingConfig = {
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  logRocketAppId: import.meta.env.VITE_LOGROCKET_APP_ID,
  customEndpoint: import.meta.env.VITE_ERROR_TRACKING_ENDPOINT,
  enableConsoleLogging: import.meta.env.DEV,
  enableInDevelopment: import.meta.env.VITE_ERROR_TRACKING_DEV === 'true',
};

export const errorTracker = new ErrorTrackingService(errorTrackingConfig);

// Export types for use in other modules
export type { ErrorContext, ErrorReport, ErrorTrackingConfig };