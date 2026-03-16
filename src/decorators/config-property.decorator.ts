/**
 * Decorator to mark properties as configuration properties
 * This is mainly for documentation and potential future tooling
 *
 * @param options - Configuration property options
 * @returns PropertyDecorator
 *
 * @example
 * ```typescript
 * export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
 *   @ConfigProperty({ description: 'Application port number' })
 *   get port() {
 *     return this.get('PORT');
 *   }
 * }
 * ```
 */
export function ConfigProperty(options?: {
  description?: string;
  required?: boolean;
  sensitive?: boolean;
}): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    // Store metadata about the config property
    const existingProperties = Reflect.getMetadata('config:properties', target.constructor) || [];
    existingProperties.push({
      key: propertyKey,
      ...options,
    });
    Reflect.defineMetadata('config:properties', existingProperties, target.constructor);
  };
}

/**
 * Get configuration properties metadata from a class
 *
 * @param target - The target class
 * @returns Array of configuration property metadata
 */
export function getConfigProperties(target: any): Array<{
  key: string | symbol;
  description?: string;
  required?: boolean;
  sensitive?: boolean;
}> {
  return Reflect.getMetadata('config:properties', target) || [];
}
