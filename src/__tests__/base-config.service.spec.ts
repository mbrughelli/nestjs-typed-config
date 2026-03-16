import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseTypedConfigService } from '../base-config.service';

const testSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
});

@Injectable()
class TestConfigService extends BaseTypedConfigService<typeof testSchema> {
  protected readonly schema = testSchema;

  get nodeEnv() {
    return this.get('NODE_ENV');
  }

  get port() {
    return this.get('PORT');
  }

  get databaseUrl() {
    return this.get('DATABASE_URL');
  }

  get portWithFallback() {
    return this.getWithFallback('PORT', 8080);
  }

  get allValues() {
    return this.getAll();
  }

  get envIsTest() {
    return this.isTest();
  }

  get envIsDevelopment() {
    return this.isDevelopment();
  }

  get envIsProduction() {
    return this.isProduction();
  }
}

function createMockConfigService(values: Record<string, unknown>) {
  return {
    get: jest.fn((key: string, fallbackOrOptions?: unknown) => {
      if (typeof fallbackOrOptions === 'object' && fallbackOrOptions !== null) {
        // Called with options like { infer: true }
        return values[key];
      }
      // Called with a fallback value
      return values[key] ?? fallbackOrOptions;
    }),
  } as unknown as ConfigService;
}

describe('BaseTypedConfigService', () => {
  it('should return typed values via get()', () => {
    const configService = createMockConfigService({
      NODE_ENV: 'development',
      PORT: 3000,
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    const service = new TestConfigService(configService as any);

    expect(service.nodeEnv).toBe('development');
    expect(service.port).toBe(3000);
    expect(service.databaseUrl).toBe('postgresql://localhost:5432/db');
  });

  it('should return fallback value via getWithFallback()', () => {
    const configService = createMockConfigService({
      NODE_ENV: 'test',
      PORT: undefined,
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    const service = new TestConfigService(configService as any);

    expect(service.portWithFallback).toBe(8080);
  });

  it('should return actual value over fallback when present', () => {
    const configService = createMockConfigService({
      NODE_ENV: 'test',
      PORT: 4000,
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    const service = new TestConfigService(configService as any);

    expect(service.portWithFallback).toBe(4000);
  });

  it('should return all values via getAll()', () => {
    const configService = createMockConfigService({
      NODE_ENV: 'test',
      PORT: 3000,
      DATABASE_URL: 'postgresql://localhost:5432/db',
    });

    const service = new TestConfigService(configService as any);
    const all = service.allValues;

    // getAll() returns the configService itself cast as the type
    expect(all).toBeDefined();
  });

  describe('environment detection', () => {
    it('isTest() returns true when NODE_ENV is test', () => {
      const configService = createMockConfigService({ NODE_ENV: 'test' });
      const service = new TestConfigService(configService as any);

      expect(service.envIsTest).toBe(true);
      expect(service.envIsDevelopment).toBe(false);
      expect(service.envIsProduction).toBe(false);
    });

    it('isProduction() returns true when NODE_ENV is production', () => {
      const configService = createMockConfigService({ NODE_ENV: 'production' });
      const service = new TestConfigService(configService as any);

      expect(service.envIsProduction).toBe(true);
      expect(service.envIsTest).toBe(false);
      expect(service.envIsDevelopment).toBe(false);
    });

    it('isDevelopment() returns true for dev', () => {
      const configService = createMockConfigService({ NODE_ENV: 'dev' });
      const service = new TestConfigService(configService as any);

      expect(service.envIsDevelopment).toBe(true);
      expect(service.envIsTest).toBe(false);
      expect(service.envIsProduction).toBe(false);
    });

    it('isDevelopment() returns true for development', () => {
      const configService = createMockConfigService({ NODE_ENV: 'development' });
      const service = new TestConfigService(configService as any);

      expect(service.envIsDevelopment).toBe(true);
    });
  });
});
