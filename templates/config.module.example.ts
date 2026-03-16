import { Global, Module } from '@nestjs/common';
import { createTypedConfigModule } from '@mbrughelli/nestjs-typed-config';
import { AppConfigService } from './config.service.example';
import { envSchema } from './env.validation.example';

/**
 * Example 1: Using the factory function (Recommended)
 */
export const ConfigModule = createTypedConfigModule({
  schema: envSchema,
  serviceClass: AppConfigService,
  validate: true,
  ignoreValidationInTest: true,
  isGlobal: true,
});

/**
 * Example 2: Manual module definition (Advanced usage)
 */
@Global()
@Module({
  imports: [
    // You can also import the base ConfigModule manually if you need more control
    // ConfigModule.forRoot({
    //   validate: validateEnv,
    //   isGlobal: true,
    // }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ManualConfigModule {}

/**
 * Example 3: Environment-specific configuration
 */
export const createEnvironmentConfigModule = (environment: 'development' | 'production' | 'test') => {
  return createTypedConfigModule({
    schema: envSchema,
    serviceClass: AppConfigService,
    validate: environment !== 'test', // Skip validation in test
    isGlobal: true,
    customValidation: environment === 'production' ? (config) => {
      const result = envSchema.parse(config);
      
      // Additional production validations
      if (!result.SENTRY_DSN) {
        throw new Error('SENTRY_DSN is required in production');
      }
      
      if (result.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
      }
      
      return result;
    } : undefined,
  });
};

/**
 * Example 4: Multiple configuration modules for microservices
 */
export const DatabaseConfigModule = createTypedConfigModule({
  schema: envSchema.pick({
    DATABASE_URL: true,
    DATABASE_SSL: true,
  }),
  serviceClass: class DatabaseConfigService extends AppConfigService {},
  isGlobal: false, // Only available where imported
});

export const AuthConfigModule = createTypedConfigModule({
  schema: envSchema.pick({
    JWT_SECRET: true,
    JWT_EXPIRES_IN: true,
    JWT_REFRESH_SECRET: true,
    JWT_REFRESH_EXPIRES_IN: true,
  }),
  serviceClass: class AuthConfigService extends AppConfigService {},
  isGlobal: false,
});

/**
 * Example 5: Testing configuration module
 */
export const createTestConfigModule = (overrides: Record<string, any> = {}) => {
  return createTypedConfigModule({
    schema: envSchema,
    serviceClass: AppConfigService,
    validate: false, // Skip validation in tests
    isGlobal: true,
    customValidation: () => ({
      NODE_ENV: 'test',
      PORT: 3001,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test_db',
      JWT_SECRET: 'test-jwt-secret-32-characters-long',
      JWT_REFRESH_SECRET: 'test-refresh-secret-32-characters-long',
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
      ...overrides,
    }),
  });
};