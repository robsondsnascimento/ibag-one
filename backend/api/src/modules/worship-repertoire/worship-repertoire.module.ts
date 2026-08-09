import { Module } from '@nestjs/common';
import { WorshipRepertoireController } from './worship-repertoire.controller';
import { WorshipRepertoireService } from './worship-repertoire.service';

@Module({
  controllers: [WorshipRepertoireController],
  providers: [WorshipRepertoireService],
})
export class WorshipRepertoireModule {}
