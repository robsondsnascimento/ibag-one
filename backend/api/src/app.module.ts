import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { PersonModule } from './modules/person/person.module';

@Module({
  imports: [HealthModule, DatabaseModule, PersonModule],
})
export class AppModule {}
