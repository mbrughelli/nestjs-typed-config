import { createTypedConfigModule } from '@mbrughelli/nestjs-typed-config';
import { AppConfigService } from './config.service';
import { envSchema } from './env.validation';

export const ConfigModule = createTypedConfigModule({
  schema: envSchema,
  serviceClass: AppConfigService,
});