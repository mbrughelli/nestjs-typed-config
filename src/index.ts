/**
 * @mbrughelli/nestjs-typed-config
 * 
 * Type-safe configuration module for NestJS applications with Zod validation
 * 
 * @author Michael Brughelli
 * @license MIT
 */

// Core classes and functions
export * from './base-config.service';
export * from './base-config.module';

// Interfaces and types
export * from './interfaces';

// Decorators
export * from './decorators';

// Re-export commonly used Zod types for convenience
export { z } from 'zod';