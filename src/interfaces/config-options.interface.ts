import { z } from 'zod';
import { Type } from '@nestjs/common';

/**
 * Configuration options for creating a typed config module
 */
export interface TypedConfigOptions<T extends z.ZodSchema> {
  /**
   * Zod schema for environment validation
   */
  schema: T;

  /**
   * Whether to validate environment variables
   * @default true
   */
  validate?: boolean;

  /**
   * Whether to ignore validation in test environment
   * @default true
   */
  ignoreValidationInTest?: boolean;

  /**
   * Custom validation function (overrides default schema validation)
   */
  customValidation?: (config: Record<string, unknown>) => z.infer<T>;

  /**
   * Whether the module should be global
   * @default true
   */
  isGlobal?: boolean;
}

/**
 * Options for creating a typed config service
 */
export interface TypedConfigServiceOptions<T extends z.ZodSchema> {
  /**
   * Zod schema for environment validation
   */
  schema: T;

  /**
   * Service class that extends BaseTypedConfigService
   */
  serviceClass?: Type<any>;
}
