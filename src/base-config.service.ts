import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';
import { EnvironmentType } from './interfaces';

/**
 * Abstract base class for typed configuration services
 * 
 * @template T - The Zod schema type for environment validation
 * 
 * @example
 * ```typescript
 * const envSchema = z.object({
 *   NODE_ENV: z.enum(['dev', 'production', 'test']),
 *   PORT: z.coerce.number().default(3000),
 *   DATABASE_URL: z.string().url(),
 * });
 * 
 * @Injectable()
 * export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
 *   get nodeEnv() {
 *     return this.get('NODE_ENV');
 *   }
 *   
 *   get port() {
 *     return this.get('PORT');
 *   }
 *   
 *   get databaseUrl() {
 *     return this.get('DATABASE_URL');
 *   }
 * }
 * ```
 */
@Injectable()
export abstract class BaseTypedConfigService<T extends z.ZodSchema> {
  /**
   * The Zod schema used for validation
   * This should be implemented by the extending class
   */
  protected abstract readonly schema: T;

  constructor(private readonly configService: ConfigService<EnvironmentType<T>, true>) {}

  /**
   * Get a configuration value by key with full type safety
   * 
   * @param key - The configuration key
   * @returns The typed configuration value
   */
  protected get<K extends keyof EnvironmentType<T>>(key: K): EnvironmentType<T>[K] {
    return this.configService.get(key as string, { infer: true });
  }

  /**
   * Get a configuration value with a fallback
   * 
   * @param key - The configuration key
   * @param fallback - Fallback value if the key is not found
   * @returns The configuration value or fallback
   */
  protected getWithFallback<K extends keyof EnvironmentType<T>>(
    key: K,
    fallback: EnvironmentType<T>[K]
  ): EnvironmentType<T>[K] {
    return this.configService.get(key as string, fallback as any);
  }

  /**
   * Get all configuration values
   * 
   * @returns All configuration values as a typed object
   */
  protected getAll(): EnvironmentType<T> {
    // Note: This assumes the ConfigService has been properly validated
    return this.configService as any;
  }

  /**
   * Check if running in test environment
   * 
   * @returns True if NODE_ENV is 'test'
   */
  protected isTest(): boolean {
    const nodeEnv = this.configService.get('NODE_ENV' as any);
    return nodeEnv === 'test';
  }

  /**
   * Check if running in development environment
   * 
   * @returns True if NODE_ENV is 'dev' or 'development'
   */
  protected isDevelopment(): boolean {
    const nodeEnv = this.configService.get('NODE_ENV' as any);
    return nodeEnv === 'dev' || nodeEnv === 'development';
  }

  /**
   * Check if running in production environment
   * 
   * @returns True if NODE_ENV is 'production'
   */
  protected isProduction(): boolean {
    const nodeEnv = this.configService.get('NODE_ENV' as any);
    return nodeEnv === 'production';
  }
}