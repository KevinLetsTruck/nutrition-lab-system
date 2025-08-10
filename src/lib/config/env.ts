/**
 * Environment Configuration Management
 * 
 * Provides a robust, type-safe way to access environment variables
 * with proper error handling and debugging capabilities.
 */

type EnvironmentVariables = {
  ANTHROPIC_API_KEY?: string;
  OPENAI_API_KEY?: string;
  DATABASE_URL?: string;
  DIRECT_URL?: string;
  JWT_SECRET?: string;
  NODE_ENV?: string;
  PORT?: string;
};

class EnvironmentConfig {
  private static instance: EnvironmentConfig | null = null;
  private config: EnvironmentVariables;

  private constructor() {
    // Load all environment variables
    this.config = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    };
  }

  /**
   * Get singleton instance
   * In production, always creates a fresh instance to ensure latest env vars
   */
  public static getInstance(): EnvironmentConfig {
    // In production, always create fresh instance
    if (process.env.NODE_ENV === 'production') {
      return new EnvironmentConfig();
    }

    // In development, use singleton pattern
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }

    return EnvironmentConfig.instance;
  }

  /**
   * Get environment variable value
   * Returns undefined if not set
   */
  public get(key: keyof EnvironmentVariables): string | undefined {
    return this.config[key];
  }

  /**
   * Get environment variable value or throw error
   * Useful for required environment variables
   */
  public getOrThrow(key: keyof EnvironmentVariables): string {
    const value = this.config[key];
    
    if (!value) {
      throw new Error(
        `Environment variable ${key} is not set. Please check your .env file or deployment configuration.`
      );
    }
    
    return value;
  }

  /**
   * Get all environment variables
   * Useful for debugging and health checks
   */
  public getAll(): EnvironmentVariables {
    return { ...this.config };
  }

  /**
   * Check if environment variable is set
   */
  public has(key: keyof EnvironmentVariables): boolean {
    return !!this.config[key];
  }

  /**
   * Debug method that safely logs environment status
   * Masks sensitive values for security
   */
  public debug(): void {
    console.log('=== Environment Configuration Debug ===');
    console.log(`NODE_ENV: ${this.get('NODE_ENV') || 'not set'}`);
    console.log(`PORT: ${this.get('PORT') || 'not set'}`);
    
    // Log sensitive variables with masked values
    const sensitiveVars: (keyof EnvironmentVariables)[] = [
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
      'DATABASE_URL',
      'DIRECT_URL',
      'JWT_SECRET'
    ];

    sensitiveVars.forEach(key => {
      const value = this.get(key);
      if (value) {
        const masked = this.maskValue(value);
        console.log(`${key}: ${masked} (${value.length} chars)`);
      } else {
        console.log(`${key}: not set`);
      }
    });

    console.log('=====================================');
  }

  /**
   * Get environment status for health checks
   */
  public getStatus(): { variable: string; isSet: boolean }[] {
    const allVars: (keyof EnvironmentVariables)[] = [
      'ANTHROPIC_API_KEY',
      'OPENAI_API_KEY',
      'DATABASE_URL',
      'DIRECT_URL',
      'JWT_SECRET',
      'NODE_ENV',
      'PORT'
    ];

    return allVars.map(variable => ({
      variable,
      isSet: this.has(variable)
    }));
  }

  /**
   * Validate required environment variables
   * Returns array of missing required variables
   */
  public validateRequired(required: (keyof EnvironmentVariables)[]): string[] {
    return required.filter(key => !this.has(key));
  }

  /**
   * Mask sensitive value for logging
   */
  private maskValue(value: string): string {
    if (value.length <= 8) {
      return '***';
    }
    
    const firstChars = value.substring(0, 4);
    const lastChars = value.substring(value.length - 4);
    
    return `${firstChars}...${lastChars}`;
  }

  /**
   * Check if running in production
   */
  public isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if running in development
   */
  public isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Get port number with fallback
   */
  public getPort(): number {
    const port = this.get('PORT');
    return port ? parseInt(port, 10) : 3000;
  }
}

// Export singleton instance
export const env = EnvironmentConfig.getInstance();

// Export class for type usage
export { EnvironmentConfig };

// Export type for environment variables
export type { EnvironmentVariables };