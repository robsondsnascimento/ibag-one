import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { DatabaseModule } from './database/database.module';

import { PersonModule } from './modules/person/person.module';
import { CampusService } from './modules/campus/campus.service';
import { CampusModule } from './modules/campus/campus.module';
import { CellModule } from './modules/cell/cell.module';
import { CellMembershipModule } from './modules/cell-membership/cell-membership.module';
import { CellLeadershipModule } from './modules/cell-leadership/cell-leadership.module';
import { CellNetworkModule } from './modules/cell-network/cell-network.module';
import { CellNetworkSupervisionModule } from './modules/cell-network-supervision/cell-network-supervision.module';
import { CellCampusCoordinationModule } from './modules/cell-campus-coordination/cell-campus-coordination.module';
import { CellMeetingModule } from './modules/cell-meeting/cell-meeting.module';
import { CellMeetingAttendanceModule } from './modules/cell-meeting-attendance/cell-meeting-attendance.module';
import { CellStudyModule } from './modules/cell-study/cell-study.module';
import { CellMeetingVisitorModule } from './modules/cell-meeting-visitor/cell-meeting-visitor.module';
import { PastoralCareModule } from './modules/pastoral-care/pastoral-care.module';
import { PastoralDashboardModule } from './modules/pastoral-dashboard/pastoral-dashboard.module';
import { CellLocationModule } from './modules/cell-location/cell-location.module';
import { CellSupportRoleModule } from './modules/cell-support-role/cell-support-role.module';
import { CellMultiplicationModule } from './modules/cell-multiplication/cell-multiplication.module';
import { PersonJourneyModule } from './modules/person-journey/person-journey.module';
import { FamilyModule } from './modules/family/family.module';
import { ServiceAreaModule } from './modules/service-area/service-area.module';
import { ServiceAreaOnboardingModule } from './modules/service-area-onboarding/service-area-onboarding.module';
import { SpaceModule } from './modules/space/space.module';
import { EventModule } from './modules/event/event.module';
import { NotificationModule } from './modules/notification/notification.module';
import { KidsModule } from './modules/kids/kids.module';
import { KidsResourceModule } from './modules/kids-resource/kids-resource.module';
import { WorshipOrderModule } from './modules/worship-order/worship-order.module';
import { WorshipRepertoireModule } from './modules/worship-repertoire/worship-repertoire.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { validateEnvironment } from './config/environment.validation';
import { AuditModule } from './modules/audit/audit.module';
import { AuditInterceptor } from './modules/audit/audit.interceptor';
import { IntegrationsModule } from './modules/integrations/integrations.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    AuditModule,

    IntegrationsModule,

    HealthModule,

    DatabaseModule,

    PersonModule,

    CampusModule,

    CellModule,

    AuthModule,

    UserModule,

    OrganizationModule,

    CellMembershipModule,

    CellLeadershipModule,

    CellNetworkModule,

    CellNetworkSupervisionModule,

    CellCampusCoordinationModule,

    CellMeetingModule,

    CellMeetingAttendanceModule,

    CellStudyModule,

    CellMeetingVisitorModule,

    PastoralCareModule,

    PastoralDashboardModule,

    CellLocationModule,

    CellSupportRoleModule,

    CellMultiplicationModule,

    PersonJourneyModule,

    FamilyModule,

    ServiceAreaModule,

    ServiceAreaOnboardingModule,

    SpaceModule,

    EventModule,

    NotificationModule,

    KidsModule,

    KidsResourceModule,

    WorshipOrderModule,

    WorshipRepertoireModule,
  ],

  providers: [
    CampusService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
