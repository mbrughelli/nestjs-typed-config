/**
 * Base environment interface that all environment schemas should extend
 */
export interface BaseEnvironment {
  NODE_ENV?: string;
}

/**
 * Type helper for extracting environment type from Zod schema
 */
export type EnvironmentType<T> = T extends { _output: infer U } ? U : never;