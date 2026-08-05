import { Module } from '@nestjs/common';
import { CampusController } from './campus.controller';
import { CampusService } from './campus.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
  ],
  controllers: [
    CampusController,
  ],
  providers: [
    CampusService,
  ],
})
export class CampusModule {}
