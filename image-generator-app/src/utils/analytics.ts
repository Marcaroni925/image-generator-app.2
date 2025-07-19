import { logger } from './logger';

interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface UserProperties {
  userId?: string;
  sessionId: string;
  userAgent: string;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !import.meta.env.DEV || import.meta.env.VITE_ANALYTICS_ENABLED === 'true';
    this.userProperties = {
      sessionId: this.generateSessionId(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    };
  }

  private generateSessionId(): string {
    return `${Date.now()}-${crypto.randomUUID()}`;
  }

  setUserId(userId: string): void {
    this.userProperties.userId = userId;
    logger.debug('Analytics user ID set', { userId });
  }

  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) {
      logger.debug('Analytics tracking disabled', { eventName, properties });
      return;
    }

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        sessionId: this.userProperties.sessionId,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };

    this.events.push(event);
    
    logger.debug('Analytics event tracked', event);
    
    // Send to analytics service
    this.sendToAnalytics(event);
  }

  private sendToAnalytics(event: AnalyticsEvent): void {
    // Integration with analytics service (e.g., Google Analytics, Mixpanel, etc.)
    // This is a placeholder - implement based on your analytics service
    
    if (import.meta.env.VITE_ANALYTICS_ID) {
      // Example: Google Analytics 4
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', event.name, {
          ...event.properties,
          event_category: 'user_interaction',
        });
      }
    }
    
    // Example: Custom analytics endpoint
    if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
      fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          user: this.userProperties,
        }),
      }).catch((error) => {
        logger.error('Failed to send analytics event', error, { event });
      });
    }
  }

  // Common event tracking methods
  trackPageView(page: string, title?: string): void {
    this.track('page_view', {
      page,
      title,
      url: window.location.href,
    });
  }

  trackImageGeneration(prompt: string, success: boolean, duration?: number): void {
    this.track('image_generation', {
      prompt_length: prompt.length,
      success,
      duration,
    });
  }

  trackImageDownload(imageId: string, format: string): void {
    this.track('image_download', {
      image_id: imageId,
      format,
    });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    this.track('error', {
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  trackUserAction(action: string, context?: Record<string, any>): void {
    this.track('user_action', {
      action,
      ...context,
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  getSessionId(): string {
    return this.userProperties.sessionId;
  }
}

export const analytics = new Analytics();