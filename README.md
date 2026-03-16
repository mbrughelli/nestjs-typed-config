# @nestjs-typed-config/core

[![npm version](https://badge.fury.io/js/@nestjs-typed-config%2Fcore.svg)](https://badge.fury.io/js/@nestjs-typed-config%2Fcore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-96.47%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-93.47%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-96.29%25-brightgreen.svg?style=flat) |

Type-safe configuration module for NestJS applications with Zod validation. Say goodbye to `process.env` scattered throughout your codebase and hello to fully typed, validated configuration!

## ✨ Features

- 🎯 **Type-safe configuration** - Full TypeScript support with IntelliSense
- 🛡️ **Runtime validation** - Powered by Zod schemas
- 🧪 **Testing utilities** - Built-in mocks and test helpers
- 🚀 **Zero configuration** - Works out of the box with sensible defaults
- 🔒 **Environment-aware** - Built-in development/production/test detection
- 📝 **Self-documenting** - Configuration properties with descriptions
- 🎪 **Factory patterns** - Easy integration with async module configuration
- 🌍 **Global by default** - Available throughout your application

## 📦 Installation

```bash
npm install @nestjs-typed-config/core zod
# or
yarn add @nestjs-typed-config/core zod
# or
pnpm add @nestjs-typed-config/core zod
```

## 🚀 Quick Start

### 1. Define your environment schema

```typescript
// src/config/env.validation.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'production', 'test']).default('dev'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
});

export type Environment = z.infer<typeof envSchema>;
```

### 2. Create your typed config service

```typescript
// src/config/config.service.ts
import { Injectable } from '@nestjs/common';
import { BaseTypedConfigService } from '@nestjs-typed-config/core';
import { envSchema, Environment } from './env.validation';

@Injectable()
export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
  protected readonly schema = envSchema;

  get nodeEnv(): Environment['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get port(): Environment['PORT'] {
    return this.get('PORT');
  }

  get databaseUrl(): Environment['DATABASE_URL'] {
    return this.get('DATABASE_URL');
  }

  get jwtSecret(): Environment['JWT_SECRET'] {
    return this.get('JWT_SECRET');
  }

  // Utility methods
  get isDevelopment(): boolean {
    return this.nodeEnv === 'dev';
  }

  get databaseConfig() {
    return {
      url: this.databaseUrl,
      ssl: this.isProduction(),
    };
  }
}
```

### 3. Create your config module

```typescript
// src/config/config.module.ts
import { createTypedConfigModule } from '@nestjs-typed-config/core';
import { AppConfigService } from './config.service';
import { envSchema } from './env.validation';

export const ConfigModule = createTypedConfigModule({
  schema: envSchema,
  serviceClass: AppConfigService,
});
```

### 4. Import in your app module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';

@Module({
  imports: [ConfigModule],
  // ConfigModule is global, so AppConfigService is available everywhere
})
export class AppModule {}
```

### 5. Use anywhere in your application

```typescript
// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../config/config.service';

@Injectable()
export class AuthService {
  constructor(private readonly config: AppConfigService) {}

  createToken() {
    // Fully typed! No more process.env.JWT_SECRET
    return jwt.sign(payload, this.config.jwtSecret);
  }
}
```

## 🎭 Advanced Usage

### Factory Pattern for Async Configuration

```typescript
// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigService } from '../config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: AppConfigService) => ({
        type: 'postgres',
        url: config.databaseUrl,
        ssl: config.isProduction(),
        // ... other options
      }),
      inject: [AppConfigService],
    }),
  ],
})
export class DatabaseModule {}
```

### Environment-Specific Validation

```typescript
export const createConfigModule = (environment: string) => {
  return createTypedConfigModule({
    schema: envSchema,
    serviceClass: AppConfigService,
    customValidation: environment === 'production' ? (config) => {
      const result = envSchema.parse(config);
      
      // Additional production validations
      if (!result.SENTRY_DSN) {
        throw new Error('SENTRY_DSN is required in production');
      }
      
      return result;
    } : undefined,
  });
};
```

### Testing with Mocks

```typescript
// src/auth/auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { createTypedConfigMock } from '@nestjs-typed-config/core/testing';
import { AppConfigService } from '../config/config.service';
import { envSchema } from '../config/env.validation';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  
  beforeEach(async () => {
    const mockConfig = createTypedConfigMock(envSchema, {
      JWT_SECRET: 'test-secret-32-characters-long!!!',
      NODE_ENV: 'test',
    });

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AppConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // Your tests here...
});
```

## 📖 API Reference

### `BaseTypedConfigService<T>`

Abstract base class for your configuration service.

#### Protected Methods

- `get<K>(key: K): T[K]` - Get a configuration value with full type safety
- `getWithFallback<K>(key: K, fallback: T[K]): T[K]` - Get a value with fallback
- `getAll(): T` - Get all configuration values
- `isTest(): boolean` - Check if running in test environment
- `isDevelopment(): boolean` - Check if running in development
- `isProduction(): boolean` - Check if running in production

### `createTypedConfigModule(options)`

Factory function to create a typed configuration module.

#### Options

```typescript
interface TypedConfigOptions<T extends z.ZodSchema> {
  schema: T;                           // Zod schema for validation
  serviceClass: Type<any>;            // Your config service class
  validate?: boolean;                 // Enable validation (default: true)
  ignoreValidationInTest?: boolean;   // Skip validation in test (default: true)
  customValidation?: (config) => T;   // Custom validation function
  isGlobal?: boolean;                 // Make module global (default: true)
}
```

### `@ConfigProperty(options?)`

Decorator for documenting configuration properties.

```typescript
@ConfigProperty({ 
  description: 'JWT secret key', 
  required: true, 
  sensitive: true 
})
get jwtSecret() {
  return this.get('JWT_SECRET');
}
```

## 🧪 Testing Utilities

The package includes comprehensive testing utilities:

```typescript
import { 
  createTypedConfigMock, 
  MockTypedConfigService,
  createTestConfig 
} from '@nestjs-typed-config/core/testing';

// Create a mock with default values
const mockConfig = createTypedConfigMock(envSchema);

// Create a mock with overrides
const mockConfig = createTypedConfigMock(envSchema, {
  NODE_ENV: 'test',
  PORT: 3001,
});

// Create basic test configuration
const testConfig = createTestConfig();
```

## 🔄 Migration Guide

### From `process.env` scattered usage

**Before:**
```typescript
// ❌ Scattered throughout your codebase
const jwtSecret = process.env.JWT_SECRET;
const port = parseInt(process.env.PORT || '3000');
const dbUrl = process.env.DATABASE_URL;
```

**After:**
```typescript
// ✅ Centralized, typed, and validated
constructor(private readonly config: AppConfigService) {}

// Fully typed with IntelliSense!
const jwtSecret = this.config.jwtSecret;
const port = this.config.port;
const dbUrl = this.config.databaseUrl;
```

### From NestJS ConfigService

**Before:**
```typescript
// ❌ No type safety
constructor(private readonly config: ConfigService) {}

const jwtSecret = this.config.get<string>('JWT_SECRET');
const port = this.config.get<number>('PORT', 3000);
```

**After:**
```typescript
// ✅ Fully typed and validated
constructor(private readonly config: AppConfigService) {}

const jwtSecret = this.config.jwtSecret; // string
const port = this.config.port; // number
```

## 🎯 Best Practices

### 1. Group Related Configuration

```typescript
export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
  // Group related configs into objects
  get databaseConfig() {
    return {
      url: this.databaseUrl,
      ssl: this.isProduction(),
      maxConnections: this.databaseMaxConnections,
    };
  }

  get redisConfig() {
    return {
      host: this.redisHost,
      port: this.redisPort,
      password: this.redisPassword,
    };
  }
}
```

### 2. Use Computed Properties

```typescript
export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
  get maxFileSizeBytes(): number {
    return this.maxFileSizeMb * 1024 * 1024;
  }

  get isSwaggerEnabled(): boolean {
    return this.enableSwagger && !this.isProduction();
  }

  get corsOrigins(): string[] {
    return this.allowedOrigins.split(',').map(origin => origin.trim());
  }
}
```

### 3. Environment-Specific Behavior

```typescript
get logLevel(): LogLevel {
  if (this.isTest()) return 'error';
  if (this.isDevelopment()) return 'debug';
  return this.get('LOG_LEVEL');
}

get shouldEnableSwagger(): boolean {
  return this.isDevelopment() || this.get('ENABLE_SWAGGER');
}
```

## 🔧 Template Files

The package includes template files in the `templates/` directory:

- `env.validation.example.ts` - Comprehensive environment schema
- `config.service.example.ts` - Feature-rich configuration service
- `config.module.example.ts` - Various module configuration patterns

Copy these files to your project and modify them according to your needs.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on top of [NestJS](https://nestjs.com/) and [Zod](https://zod.dev/)
- Inspired by the need for type-safe configuration in NestJS applications
- Thanks to the open-source community for making this possible

---

**Made with ❤️ for the NestJS community**