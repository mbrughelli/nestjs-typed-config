import { z } from 'zod';
import { EnvironmentType } from '../interfaces';

/**
 * Create a mock configuration service for testing
 * 
 * @param schema - The Zod schema to base the mock on
 * @param overrides - Override values for specific properties
 * @returns A mock configuration object
 * 
 * @example
 * ```typescript
 * const envSchema = z.object({
 *   NODE_ENV: z.enum(['dev', 'production', 'test']),
 *   PORT: z.coerce.number().default(3000),
 *   DATABASE_URL: z.string().url(),
 * });
 * 
 * const mockConfig = createTypedConfigMock(envSchema, {
 *   NODE_ENV: 'test',
 *   DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
 * });
 * 
 * // Use in tests
 * const module = await Test.createTestingModule({
 *   providers: [
 *     {
 *       provide: AppConfigService,
 *       useValue: mockConfig,
 *     },
 *   ],
 * }).compile();
 * ```
 */
export function createTypedConfigMock<T extends z.ZodSchema>(
  schema: T,
  overrides: Partial<EnvironmentType<T>> = {}
): MockTypedConfigService<T> {
  // Get default values from schema
  const defaults = getSchemaDefaults(schema);
  
  return new MockTypedConfigService(schema, {
    ...defaults,
    ...overrides,
  });
}

/**
 * Mock implementation of a typed configuration service
 */
export class MockTypedConfigService<T extends z.ZodSchema> {
  constructor(
    private readonly schema: T,
    private readonly values: Partial<EnvironmentType<T>>
  ) {
    // Create getters for all schema properties
    this.createGetters();
  }

  private createGetters(): void {
    const shape = this.getSchemaShape(this.schema);
    
    for (const key of Object.keys(shape)) {
      if (!this.hasOwnProperty(key)) {
        Object.defineProperty(this, key, {
          get: () => this.values[key as keyof EnvironmentType<T>],
          enumerable: true,
          configurable: true,
        });
      }
    }
  }

  private getSchemaShape(schema: z.ZodSchema): Record<string, any> {
    if ('shape' in schema && schema.shape) {
      return schema.shape as Record<string, any>;
    }
    return {};
  }

  /**
   * Update mock values
   */
  updateValues(newValues: Partial<EnvironmentType<T>>): void {
    Object.assign(this.values, newValues);
  }

  /**
   * Get a specific value
   */
  getValue<K extends keyof EnvironmentType<T>>(key: K): EnvironmentType<T>[K] {
    return this.values[key];
  }

  /**
   * Check if running in test environment
   */
  isTest(): boolean {
    return (this.values as any).NODE_ENV === 'test';
  }

  /**
   * Check if running in development environment
   */
  isDevelopment(): boolean {
    const nodeEnv = (this.values as any).NODE_ENV;
    return nodeEnv === 'dev' || nodeEnv === 'development';
  }

  /**
   * Check if running in production environment
   */
  isProduction(): boolean {
    return (this.values as any).NODE_ENV === 'production';
  }
}

/**
 * Extract default values from a Zod schema
 */
function getSchemaDefaults<T extends z.ZodSchema>(schema: T): Partial<EnvironmentType<T>> {
  try {
    // Attempt to parse an empty object to get defaults
    const result = schema.safeParse({});
    if (result.success) {
      return result.data;
    }
    
    // If that fails, try to extract defaults from schema shape
    if ('shape' in schema && schema.shape) {
      const defaults: any = {};
      const shape = schema.shape as Record<string, any>;
      
      for (const [key, fieldSchema] of Object.entries(shape)) {
        if ('_def' in fieldSchema && fieldSchema._def.defaultValue) {
          defaults[key] = fieldSchema._def.defaultValue();
        }
      }
      
      return defaults;
    }
  } catch (error) {
    // If all else fails, return empty object
    console.warn('Could not extract defaults from schema:', error);
  }
  
  return {};
}

/**
 * Utility function to create a basic test environment configuration
 */
export function createTestConfig(): Record<string, string> {
  return {
    NODE_ENV: 'test',
    PORT: '3000',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    JWT_SECRET: 'test-jwt-secret',
    REDIS_URL: 'redis://localhost:6379',
  };
}