import { Module } from '@nestjs/common';
import { PastoralDashboardController } from './pastoral-dashboard.controller';
import { PastoralDashboardService } from './pastoral-dashboard.service';
@Module({ controllers: [PastoralDashboardController], providers: [PastoralDashboardService] }) export class PastoralDashboardModule {}
