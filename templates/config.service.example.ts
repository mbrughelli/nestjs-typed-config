import { Injectable } from '@nestjs/common';
import { BaseTypedConfigService, ConfigProperty } from '@nestjs-typed-config/core';
import { envSchema, Environment } from './env.validation';

/**
 * Example typed configuration service
 * Copy this file and modify it according to your application's needs
 */
@Injectable()
export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
  protected readonly schema = envSchema;

  // Basic app configuration
  @ConfigProperty({ description: 'Current environment (dev, production, test)' })
  get nodeEnv(): Environment['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  @ConfigProperty({ description: 'Application port number' })
  get port(): Environment['PORT'] {
    return this.get('PORT');
  }

  // Database configuration
  @ConfigProperty({ description: 'Database connection URL', sensitive: true })
  get databaseUrl(): Environment['DATABASE_URL'] {
    return this.get('DATABASE_URL');
  }

  @ConfigProperty({ description: 'Enable SSL for database connection' })
  get databaseSsl(): Environment['DATABASE_SSL'] {
    return this.get('DATABASE_SSL');
  }

  // Redis configuration
  @ConfigProperty({ description: 'Redis connection URL', sensitive: true })
  get redisUrl(): Environment['REDIS_URL'] {
    return this.get('REDIS_URL');
  }

  @ConfigProperty({ description: 'Redis host' })
  get redisHost(): Environment['REDIS_HOST'] {
    return this.get('REDIS_HOST');
  }

  @ConfigProperty({ description: 'Redis port' })
  get redisPort(): Environment['REDIS_PORT'] {
    return this.get('REDIS_PORT');
  }

  // Authentication
  @ConfigProperty({ description: 'JWT secret key', sensitive: true, required: true })
  get jwtSecret(): Environment['JWT_SECRET'] {
    return this.get('JWT_SECRET');
  }

  @ConfigProperty({ description: 'JWT token expiration time' })
  get jwtExpiresIn(): Environment['JWT_EXPIRES_IN'] {
    return this.get('JWT_EXPIRES_IN');
  }

  @ConfigProperty({ description: 'JWT refresh secret key', sensitive: true, required: true })
  get jwtRefreshSecret(): Environment['JWT_REFRESH_SECRET'] {
    return this.get('JWT_REFRESH_SECRET');
  }

  @ConfigProperty({ description: 'JWT refresh token expiration time' })
  get jwtRefreshExpiresIn(): Environment['JWT_REFRESH_EXPIRES_IN'] {
    return this.get('JWT_REFRESH_EXPIRES_IN');
  }

  // Stripe configuration
  @ConfigProperty({ description: 'Stripe secret key', sensitive: true, required: true })
  get stripeSecretKey(): Environment['STRIPE_SECRET_KEY'] {
    return this.get('STRIPE_SECRET_KEY');
  }

  @ConfigProperty({ description: 'Stripe publishable key' })
  get stripePublishableKey(): Environment['STRIPE_PUBLISHABLE_KEY'] {
    return this.get('STRIPE_PUBLISHABLE_KEY');
  }

  @ConfigProperty({ description: 'Stripe webhook secret', sensitive: true })
  get stripeWebhookSecret(): Environment['STRIPE_WEBHOOK_SECRET'] {
    return this.get('STRIPE_WEBHOOK_SECRET');
  }

  // Email configuration
  @ConfigProperty({ description: 'SMTP host for sending emails' })
  get smtpHost(): Environment['SMTP_HOST'] {
    return this.get('SMTP_HOST');
  }

  @ConfigProperty({ description: 'SMTP port' })
  get smtpPort(): Environment['SMTP_PORT'] {
    return this.get('SMTP_PORT');
  }

  @ConfigProperty({ description: 'SMTP username', sensitive: true })
  get smtpUser(): Environment['SMTP_USER'] {
    return this.get('SMTP_USER');
  }

  @ConfigProperty({ description: 'SMTP password', sensitive: true })
  get smtpPass(): Environment['SMTP_PASS'] {
    return this.get('SMTP_PASS');
  }

  // Monitoring
  @ConfigProperty({ description: 'Sentry DSN for error reporting', sensitive: true })
  get sentryDsn(): Environment['SENTRY_DSN'] {
    return this.get('SENTRY_DSN');
  }

  @ConfigProperty({ description: 'Log level for application logging' })
  get logLevel(): Environment['LOG_LEVEL'] {
    return this.get('LOG_LEVEL');
  }

  // Feature flags
  @ConfigProperty({ description: 'Enable Swagger API documentation' })
  get enableSwagger(): Environment['ENABLE_SWAGGER'] {
    return this.get('ENABLE_SWAGGER');
  }

  @ConfigProperty({ description: 'Enable rate limiting middleware' })
  get enableRateLimiting(): Environment['ENABLE_RATE_LIMITING'] {
    return this.get('ENABLE_RATE_LIMITING');
  }

  // Custom business configuration
  @ConfigProperty({ description: 'Maximum file size in MB for uploads' })
  get maxFileSizeMb(): Environment['MAX_FILE_SIZE_MB'] {
    return this.get('MAX_FILE_SIZE_MB');
  }

  @ConfigProperty({ description: 'Allowed CORS origins' })
  get allowedOrigins(): Environment['ALLOWED_ORIGINS'] {
    return this.get('ALLOWED_ORIGINS');
  }

  // Utility methods
  get maxFileSizeBytes(): number {
    return this.maxFileSizeMb * 1024 * 1024;
  }

  get isSwaggerEnabled(): boolean {
    return this.enableSwagger && !this.isProduction();
  }

  get databaseConfig() {
    return {
      url: this.databaseUrl,
      ssl: this.databaseSsl,
    };
  }

  get redisConfig() {
    if (this.redisUrl) {
      return { url: this.redisUrl };
    }
    return {
      host: this.redisHost,
      port: this.redisPort,
    };
  }

  get jwtConfig() {
    return {
      secret: this.jwtSecret,
      expiresIn: this.jwtExpiresIn,
      refreshSecret: this.jwtRefreshSecret,
      refreshExpiresIn: this.jwtRefreshExpiresIn,
    };
  }

  get stripeConfig() {
    return {
      secretKey: this.stripeSecretKey,
      publishableKey: this.stripePublishableKey,
      webhookSecret: this.stripeWebhookSecret,
    };
  }

  get smtpConfig() {
    return {
      host: this.smtpHost,
      port: this.smtpPort,
      auth: this.smtpUser && this.smtpPass ? {
        user: this.smtpUser,
        pass: this.smtpPass,
      } : undefined,
    };
  }
}