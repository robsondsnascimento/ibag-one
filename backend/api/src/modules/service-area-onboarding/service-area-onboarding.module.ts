import { Module } from '@nestjs/common';
import { ServiceAreaOnboardingController } from './service-area-onboarding.controller';
import { ServiceAreaOnboardingService } from './service-area-onboarding.service';

@Module({ controllers: [ServiceAreaOnboardingController], providers: [ServiceAreaOnboardingService] })
export class ServiceAreaOnboardingModule {}
