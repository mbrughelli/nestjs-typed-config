import { createTypedConfigModule } from '@nestjs-typed-config/core';
import { AppConfigService } from './config.service';
import { envSchema } from './env.validation';

export const ConfigModule = createTypedConfigModule({
  schema: envSchema,
  serviceClass: AppConfigService,
});