import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';

@Module({
  imports: [
    ConfigModule, // Global typed configuration
  ],
  providers: [
    // Your other services can now inject AppConfigService
  ],
})
export class AppModule {
  constructor(private readonly configService: AppConfigService) {
    // Configuration is available immediately
    console.log(`App running on port ${this.configService.port}`);
    console.log(`Environment: ${this.configService.nodeEnv}`);
  }
}