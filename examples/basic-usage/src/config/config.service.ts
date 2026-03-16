import { Injectable } from '@nestjs/common';
import { BaseTypedConfigService } from '@mbrughelli/nestjs-typed-config';
import { envSchema, Environment } from './env.validation';

@Injectable()
export class AppConfigService extends BaseTypedConfigService<typeof envSchema> {
  protected readonly schema = envSchema;

  get nodeEnv(): Environment['NODE_ENV'] {
    return this.get('NODE_ENV');
  }

  get port(): Environment['PORT'] {
    return this.get('PORT');
  }

  get databaseUrl(): Environment['DATABASE_URL'] {
    return this.get('DATABASE_URL');
  }

  get jwtSecret(): Environment['JWT_SECRET'] {
    return this.get('JWT_SECRET');
  }

  get redisHost(): Environment['REDIS_HOST'] {
    return this.get('REDIS_HOST');
  }

  get redisPort(): Environment['REDIS_PORT'] {
    return this.get('REDIS_PORT');
  }

  // Utility methods
  get redisConfig() {
    return {
      host: this.redisHost,
      port: this.redisPort,
    };
  }
}