/**
 * Environment Configuration and Validation
 * Centralized environment variable management with runtime validation
 */

interface EnvironmentConfig {
  // API Configuration
  API_URL?: string;
  API_KEY?: string;
  
  // Image Service
  IMAGE_SERVICE_URL?: string;
  IMAGE_SERVICE_KEY?: string;
  
  // Analytics
  ANALYTICS_ID?: string;
  ANALYTICS_ENABLED: boolean;
  ANALYTICS_ENDPOINT?: string;
  
  // Error Tracking
  SENTRY_DSN?: string;
  LOGROCKET_APP_ID?: string;
  ERROR_TRACKING_ENDPOINT?: string;
  ERROR_TRACKING_DEV: boolean;
  
  // Application
  PROJECT_ID?: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  DEV_MODE: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

class EnvironmentValidator {
  private config: EnvironmentConfig;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.config = this.loadEnvironment();
    this.validate();
  }

  private loadEnvironment(): EnvironmentConfig {
    return {
      // API Configuration
      API_URL: import.meta.env.VITE_API_URL,
      API_KEY: import.meta.env.VITE_API_KEY,
      
      // Image Service
      IMAGE_SERVICE_URL: import.meta.env.VITE_IMAGE_SERVICE_URL,
      IMAGE_SERVICE_KEY: import.meta.env.VITE_IMAGE_SERVICE_KEY,
      
      // Analytics
      ANALYTICS_ID: import.meta.env.VITE_ANALYTICS_ID,
      ANALYTICS_ENABLED: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
      ANALYTICS_ENDPOINT: import.meta.env.VITE_ANALYTICS_ENDPOINT,
      
      // Error Tracking
      SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
      LOGROCKET_APP_ID: import.meta.env.VITE_LOGROCKET_APP_ID,
      ERROR_TRACKING_ENDPOINT: import.meta.env.VITE_ERROR_TRACKING_ENDPOINT,
      ERROR_TRACKING_DEV: import.meta.env.VITE_ERROR_TRACKING_DEV === 'true',
      
      // Application
      PROJECT_ID: import.meta.env.VITE_PROJECT_ID,
      ENVIRONMENT: this.determineEnvironment(),
      DEV_MODE: import.meta.env.DEV,
      LOG_LEVEL: (import.meta.env.VITE_LOG_LEVEL as EnvironmentConfig['LOG_LEVEL']) || 'info',
    };
  }

  private determineEnvironment(): EnvironmentConfig['ENVIRONMENT'] {
    const env = import.meta.env.VITE_ENVIRONMENT;
    if (env === 'staging' || env === 'production') {
      return env;
    }
    return import.meta.env.DEV ? 'development' : 'production';
  }

  private validate(): void {
    // Reset validation state
    this.errors = [];
    this.warnings = [];

    // Production-specific validations
    if (this.config.ENVIRONMENT === 'production') {
      this.validateProduction();
    }

    // Development-specific validations
    if (this.config.ENVIRONMENT === 'development') {
      this.validateDevelopment();
    }

    // General validations
    this.validateGeneral();

    // Report validation results
    this.reportValidation();
  }

  private validateProduction(): void {
    // Critical for production
    if (!this.config.PROJECT_ID) {
      this.errors.push('VITE_PROJECT_ID is required in production');
    }

    // Security warnings for production
    if (this.config.DEV_MODE) {
      this.warnings.push('DEV_MODE should be false in production');
    }

    if (this.config.ERROR_TRACKING_DEV) {
      this.warnings.push('ERROR_TRACKING_DEV should be false in production');
    }

    // Analytics recommended in production
    if (!this.config.ANALYTICS_ID && !this.config.ANALYTICS_ENDPOINT) {
      this.warnings.push('Analytics configuration recommended for production');
    }
  }

  private validateDevelopment(): void {
    // Development-specific checks
    if (!this.config.DEV_MODE) {
      this.warnings.push('DEV_MODE should be true in development');
    }
  }

  private validateGeneral(): void {
    // URL validations
    if (this.config.API_URL && !this.isValidUrl(this.config.API_URL)) {
      this.errors.push('VITE_API_URL must be a valid URL');
    }

    if (this.config.IMAGE_SERVICE_URL && !this.isValidUrl(this.config.IMAGE_SERVICE_URL)) {
      this.errors.push('VITE_IMAGE_SERVICE_URL must be a valid URL');
    }

    if (this.config.ANALYTICS_ENDPOINT && !this.isValidUrl(this.config.ANALYTICS_ENDPOINT)) {
      this.errors.push('VITE_ANALYTICS_ENDPOINT must be a valid URL');
    }

    if (this.config.ERROR_TRACKING_ENDPOINT && !this.isValidUrl(this.config.ERROR_TRACKING_ENDPOINT)) {
      this.errors.push('VITE_ERROR_TRACKING_ENDPOINT must be a valid URL');
    }

    // Log level validation
    const validLogLevels = ['debug', 'info', 'warn', 'error'];
    if (!validLogLevels.includes(this.config.LOG_LEVEL)) {
      this.errors.push(`VITE_LOG_LEVEL must be one of: ${validLogLevels.join(', ')}`);
    }

    // API key format validation (basic)
    if (this.config.API_KEY && this.config.API_KEY.length < 10) {
      this.warnings.push('VITE_API_KEY seems too short - check configuration');
    }

    if (this.config.IMAGE_SERVICE_KEY && this.config.IMAGE_SERVICE_KEY.length < 10) {
      this.warnings.push('VITE_IMAGE_SERVICE_KEY seems too short - check configuration');
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private reportValidation(): void {
    if (this.errors.length > 0) {
      console.error('❌ Environment Configuration Errors:');
      this.errors.forEach(error => console.error(`  • ${error}`));
      
      if (this.config.ENVIRONMENT === 'production') {
        throw new Error(`Environment validation failed: ${this.errors.join(', ')}`);
      }
    }

    if (this.warnings.length > 0) {
      console.warn('⚠️  Environment Configuration Warnings:');
      this.warnings.forEach(warning => console.warn(`  • ${warning}`));
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log(`✅ Environment configuration valid for ${this.config.ENVIRONMENT}`);
    }
  }

  public getConfig(): Readonly<EnvironmentConfig> {
    return Object.freeze({ ...this.config });
  }

  public isProduction(): boolean {
    return this.config.ENVIRONMENT === 'production';
  }

  public isDevelopment(): boolean {
    return this.config.ENVIRONMENT === 'development';
  }

  public isStaging(): boolean {
    return this.config.ENVIRONMENT === 'staging';
  }
}

// Create and validate environment on module load
const environmentValidator = new EnvironmentValidator();

// Export the validated configuration
export const env = environmentValidator.getConfig();
export const isProduction = environmentValidator.isProduction();
export const isDevelopment = environmentValidator.isDevelopment();
export const isStaging = environmentValidator.isStaging();

// Export for testing
export { EnvironmentValidator };