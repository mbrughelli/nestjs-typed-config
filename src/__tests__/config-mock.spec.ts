import { z } from 'zod';
import {
  createTypedConfigMock,
  MockTypedConfigService,
  createTestConfig,
} from '../testing/config.mock';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('test'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url().optional(),
});

describe('createTypedConfigMock', () => {
  it('should create a mock with schema defaults', () => {
    const mock = createTypedConfigMock(schema);
    expect(mock.getValue('NODE_ENV')).toBe('test');
    expect(mock.getValue('PORT')).toBe(3000);
  });

  it('should apply overrides over defaults', () => {
    const mock = createTypedConfigMock(schema, { PORT: 8080 });
    expect(mock.getValue('PORT')).toBe(8080);
  });

  it('should handle schemas with no defaults gracefully', () => {
    const strictSchema = z.object({
      API_KEY: z.string(),
    });
    const mock = createTypedConfigMock(strictSchema, { API_KEY: 'test-key' });
    expect(mock.getValue('API_KEY')).toBe('test-key');
  });
});

describe('MockTypedConfigService', () => {
  it('should support updateValues', () => {
    const mock = createTypedConfigMock(schema);
    mock.updateValues({ PORT: 9090 });
    expect(mock.getValue('PORT')).toBe(9090);
  });

  it('should create dynamic property getters from schema shape', () => {
    const mock = createTypedConfigMock(schema, {
      NODE_ENV: 'test',
      PORT: 5000,
    });
    // Access via dynamic getter
    expect((mock as any).NODE_ENV).toBe('test');
    expect((mock as any).PORT).toBe(5000);
  });

  describe('environment detection', () => {
    it('isTest() returns true when NODE_ENV is test', () => {
      const mock = createTypedConfigMock(schema, { NODE_ENV: 'test' });
      expect(mock.isTest()).toBe(true);
      expect(mock.isProduction()).toBe(false);
      expect(mock.isDevelopment()).toBe(false);
    });

    it('isProduction() returns true when NODE_ENV is production', () => {
      const mock = createTypedConfigMock(schema, { NODE_ENV: 'production' });
      expect(mock.isProduction()).toBe(true);
      expect(mock.isTest()).toBe(false);
      expect(mock.isDevelopment()).toBe(false);
    });

    it('isDevelopment() returns true for development', () => {
      const mock = createTypedConfigMock(schema, { NODE_ENV: 'development' });
      expect(mock.isDevelopment()).toBe(true);
      expect(mock.isTest()).toBe(false);
      expect(mock.isProduction()).toBe(false);
    });
  });

  it('should handle schema without shape property', () => {
    // A transformed schema won't have .shape directly
    const transformedSchema = z.object({ PORT: z.coerce.number() }).transform((val) => val);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mock = new MockTypedConfigService(transformedSchema as any, { PORT: 3000 } as any);
    expect(mock.getValue('PORT' as never)).toBe(3000);
  });
});

describe('createTestConfig', () => {
  it('should return a config object with all expected fields', () => {
    const config = createTestConfig();
    expect(config).toHaveProperty('NODE_ENV', 'test');
    expect(config).toHaveProperty('PORT', '3000');
    expect(config).toHaveProperty('DATABASE_URL');
    expect(config).toHaveProperty('JWT_SECRET');
    expect(config).toHaveProperty('REDIS_URL');
  });

  it('should return string values for all fields', () => {
    const config = createTestConfig();
    for (const value of Object.values(config)) {
      expect(typeof value).toBe('string');
    }
  });
});
