import { z } from 'zod';

/**
 * Example environment validation schema
 * Copy this file and modify it according to your application's needs
 */
export const envSchema = z.object({
  // Basic Node.js environment
  NODE_ENV: z.enum(['dev', 'development', 'production', 'test']).default('dev'),
  PORT: z.coerce.number().default(3000),

  // Database configuration
  DATABASE_URL: z.string().url(),
  DATABASE_SSL: z.coerce.boolean().default(false),

  // Redis/Cache configuration
  REDIS_URL: z.string().url().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // External API keys (mark as sensitive)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Email service
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Feature flags
  ENABLE_SWAGGER: z.coerce.boolean().default(false),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  
  // Custom business logic
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  ALLOWED_ORIGINS: z.string().transform(str => str.split(',')).default('http://localhost:3000'),
});

export type Environment = z.infer<typeof envSchema>;

/**
 * Custom validation function
 * You can add additional business logic here
 */
export function validateEnv(config: Record<string, unknown>): Environment {
  try {
    const parsed = envSchema.parse(config);
    
    // Add custom validation logic here
    if (parsed.NODE_ENV === 'production' && !parsed.SENTRY_DSN) {
      console.warn('Warning: SENTRY_DSN not set in production environment');
    }
    
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}