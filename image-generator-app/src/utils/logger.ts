type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info';

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private formatLogEntry(entry: LogEntry): string {
    const { timestamp, level, message, context } = entry;
    let formatted = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context && Object.keys(context).length > 0) {
      formatted += `\nContext: ${JSON.stringify(context, null, 2)}`;
    }
    
    return formatted;
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  debug(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, context);
    if (this.isDevelopment) {
      console.debug(this.formatLogEntry(entry));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, context);
    if (this.isDevelopment) {
      console.info(this.formatLogEntry(entry));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, context);
    if (this.isDevelopment) {
      console.warn(this.formatLogEntry(entry));
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, context, error);
    
    if (this.isDevelopment) {
      console.error(this.formatLogEntry(entry));
      if (error) {
        console.error(error);
      }
    }
    
    // In production, send to error tracking service
    if (!this.isDevelopment && error) {
      this.sendToErrorTracking(entry);
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // Dynamic import to avoid circular dependency
    import('./errorTracking').then(({ errorTracker }) => {
      errorTracker.captureError(
        entry.error || new Error(entry.message),
        {
          level: entry.level as any,
          context: entry.context,
          timestamp: new Date(entry.timestamp).getTime(),
        }
      );
    }).catch((error) => {
      console.error('Failed to send to error tracking:', error);
    });
  }
}

export const logger = new Logger();