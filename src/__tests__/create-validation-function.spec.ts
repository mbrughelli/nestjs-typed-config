import { z } from 'zod';
import { createValidationFunction } from '../base-config.module';

describe('createValidationFunction', () => {
  const schema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
  });

  const validate = createValidationFunction(schema);

  it('should return parsed values for valid config', () => {
    const result = validate({
      NODE_ENV: 'development',
      PORT: '8080',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    expect(result).toEqual({
      NODE_ENV: 'development',
      PORT: 8080,
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });
  });

  it('should coerce string values to correct types', () => {
    const result = validate({
      NODE_ENV: 'test',
      PORT: '4200',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    expect(result.PORT).toBe(4200);
    expect(typeof result.PORT).toBe('number');
  });

  it('should apply default values when fields are omitted', () => {
    const result = validate({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    expect(result.PORT).toBe(3000);
  });

  it('should throw a descriptive error for invalid enum value', () => {
    expect(() =>
      validate({
        NODE_ENV: 'invalid',
        DATABASE_URL: 'postgresql://localhost:5432/db',
      }),
    ).toThrow('Environment validation failed');
  });

  it('should throw for missing required fields', () => {
    expect(() => validate({})).toThrow('Environment validation failed');
  });

  it('should throw for invalid URL format', () => {
    expect(() =>
      validate({
        NODE_ENV: 'test',
        DATABASE_URL: 'not-a-url',
      }),
    ).toThrow('Environment validation failed');
  });

  it('should include field paths in error message', () => {
    try {
      validate({});
    } catch (error) {
      expect((error as Error).message).toContain('NODE_ENV');
      expect((error as Error).message).toContain('DATABASE_URL');
    }
  });

  it('should re-throw non-ZodError exceptions', () => {
    const badSchema = {
      parse: () => {
        throw new TypeError('something else broke');
      },
    } as unknown as z.ZodSchema;

    const badValidate = createValidationFunction(badSchema);
    expect(() => badValidate({})).toThrow(TypeError);
    expect(() => badValidate({})).toThrow('something else broke');
  });
});
