import { DynamicModule, Global, Module, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { z } from 'zod';
import { TypedConfigOptions } from './interfaces';
import { BaseTypedConfigService } from './base-config.service';

/**
 * Creates a validation function from a Zod schema
 *
 * @param schema - The Zod schema to use for validation
 * @returns A validation function compatible with NestJS ConfigModule
 */
export function createValidationFunction<T extends z.ZodSchema>(schema: T) {
  return (config: Record<string, unknown>): z.infer<T> => {
    try {
      return schema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const missingVars = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join('\n');
        throw new Error(`Environment validation failed:\n${missingVars}`);
      }
      throw error;
    }
  };
}

/**
 * Factory function to create a typed configuration module
 *
 * @param options - Configuration options
 * @returns A dynamic NestJS module
 *
 * @example
 * ```typescript
 * const envSchema = z.object({
 *   NODE_ENV: z.enum(['dev', 'production', 'test']),
 *   PORT: z.coerce.number().default(3000),
 * });
 *
 * @Injectable()
 * class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
 *   protected readonly schema = envSchema;
 *
 *   get nodeEnv() { return this.get('NODE_ENV'); }
 *   get port() { return this.get('PORT'); }
 * }
 *
 * @Module({
 *   imports: [
 *     createTypedConfigModule({
 *       schema: envSchema,
 *       serviceClass: AppConfigService,
 *     })
 *   ]
 * })
 * export class AppModule {}
 * ```
 */
export function createTypedConfigModule<T extends z.ZodSchema>(
  options: TypedConfigOptions<T> & {
    serviceClass: Type<BaseTypedConfigService<T>>;
  },
): DynamicModule {
  const {
    schema,
    serviceClass,
    validate = true,
    ignoreValidationInTest = true,
    customValidation,
    isGlobal = true,
  } = options;

  const shouldValidate = validate && !(ignoreValidationInTest && process.env.NODE_ENV === 'test');
  const validationFunction =
    customValidation || (shouldValidate ? createValidationFunction(schema) : undefined);

  const module: DynamicModule = {
    module: class TypedConfigModule {},
    imports: [
      ConfigModule.forRoot({
        validate: validationFunction,
        isGlobal,
      }),
    ],
    providers: [serviceClass],
    exports: [serviceClass],
  };

  if (isGlobal) {
    module.global = true;
  }

  return module;
}

/**
 * Abstract base module class for typed configuration
 * Extend this class to create your own configuration module
 *
 * @example
 * ```typescript
 * @Global()
 * @Module({
 *   imports: [
 *     ConfigModule.forRoot({
 *       validate: createValidationFunction(envSchema),
 *       isGlobal: true,
 *     }),
 *   ],
 *   providers: [AppConfigService],
 *   exports: [AppConfigService],
 * })
 * export class AppConfigModule extends BaseTypedConfigModule<typeof envSchema> {
 *   protected static readonly schema = envSchema;
 * }
 * ```
 */
@Global()
@Module({})
export abstract class BaseTypedConfigModule {
  /**
   * The Zod schema used for validation
   * This should be implemented by the extending class
   */
  protected static readonly schema: z.ZodSchema;

  /**
   * Create a dynamic module for the configuration
   *
   * @param options - Configuration options
   * @returns A dynamic NestJS module
   */
  static forRoot<T extends z.ZodSchema>(
    this: { schema: T } & typeof BaseTypedConfigModule,
    options?: Partial<TypedConfigOptions<T>>,
  ): DynamicModule {
    const {
      validate = true,
      ignoreValidationInTest = true,
      customValidation,
      isGlobal = true,
    } = options || {};

    const shouldValidate = validate && !(ignoreValidationInTest && process.env.NODE_ENV === 'test');
    const validationFunction =
      customValidation || (shouldValidate ? createValidationFunction(this.schema) : undefined);

    return {
      module: this as any,
      imports: [
        ConfigModule.forRoot({
          validate: validationFunction,
          isGlobal,
        }),
      ],
      global: isGlobal,
    };
  }
}
