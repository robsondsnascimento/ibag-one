import { Module } from '@nestjs/common';
import { ServiceAreaController } from './service-area.controller';
import { ServiceAreaService } from './service-area.service';

@Module({ controllers: [ServiceAreaController], providers: [ServiceAreaService] })
export class ServiceAreaModule {}
