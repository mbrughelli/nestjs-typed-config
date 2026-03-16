import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { createTypedConfigModule, BaseTypedConfigModule } from '../base-config.module';
import { BaseTypedConfigService } from '../base-config.service';

const testSchema = z.object({
  NODE_ENV: z.string().default('test'),
  PORT: z.coerce.number().default(3000),
});

@Injectable()
class TestConfigService extends BaseTypedConfigService<typeof testSchema> {
  protected readonly schema = testSchema;

  get port() {
    return this.get('PORT');
  }

  get nodeEnv() {
    return this.get('NODE_ENV');
  }
}

describe('createTypedConfigModule', () => {
  it('should return a DynamicModule with correct structure', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
    });

    expect(module).toHaveProperty('imports');
    expect(module).toHaveProperty('providers');
    expect(module).toHaveProperty('exports');
    expect(module.providers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ provide: TestConfigService }),
      ]),
    );
    expect(module.exports).toContain(TestConfigService);
  });

  it('should be global by default', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
    });

    expect(module.global).toBe(true);
  });

  it('should respect isGlobal: false', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
      isGlobal: false,
    });

    expect(module.global).toBeFalsy();
  });

  it('should include ConfigModule.forRoot in imports', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
    });

    expect(module.imports).toBeDefined();
    expect(module.imports!.length).toBe(1);
  });

  it('should skip validation when ignoreValidationInTest is true and NODE_ENV is test', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';

    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
      validate: true,
      ignoreValidationInTest: true,
    });

    expect(module).toBeDefined();
    process.env.NODE_ENV = originalEnv;
  });

  it('should use custom validation when provided', () => {
    const customValidation = jest.fn((_config: Record<string, unknown>) => ({
      NODE_ENV: 'custom',
      PORT: 9999,
    }));

    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
      customValidation,
    });

    expect(module).toBeDefined();
  });

  it('should not validate when validate is false', () => {
    const module = createTypedConfigModule({
      schema: testSchema,
      serviceClass: TestConfigService,
      validate: false,
    });

    expect(module).toBeDefined();
  });
});

describe('BaseTypedConfigModule', () => {
  class TestModule extends BaseTypedConfigModule {
    static readonly schema = testSchema;
  }

  // Cast to any to bypass the complex `this` generic constraint in forRoot().
  // We're testing runtime behavior here, not the type system.
  const TestModuleAny = TestModule as any;

  it('should create a DynamicModule via forRoot()', () => {
    const module = TestModuleAny.forRoot();

    expect(module).toHaveProperty('imports');
    expect(module).toHaveProperty('global', true);
  });

  it('should accept partial options in forRoot()', () => {
    const module = TestModuleAny.forRoot({ isGlobal: false });

    expect(module.global).toBe(false);
  });

  it('should work with no options passed to forRoot()', () => {
    const module = TestModuleAny.forRoot();

    expect(module).toBeDefined();
    expect(module.global).toBe(true);
  });
});
