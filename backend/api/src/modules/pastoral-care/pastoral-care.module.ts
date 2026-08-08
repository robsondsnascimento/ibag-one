import { Module } from '@nestjs/common';
import { PastoralCareController } from './pastoral-care.controller';
import { PastoralCareService } from './pastoral-care.service';
@Module({ controllers: [PastoralCareController], providers: [PastoralCareService] }) export class PastoralCareModule {}
