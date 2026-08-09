import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationDispatchService } from './notification-dispatch.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NotificationDispatchService],
  exports: [NotificationDispatchService],
})
export class IntegrationsModule {}
