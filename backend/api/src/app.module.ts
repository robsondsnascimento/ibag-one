import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PersonModule } from './modules/person/person.module';
import { CampusService } from './modules/campus/campus.service';
import { CampusModule } from './modules/campus/campus.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    DatabaseModule,
    PersonModule,
    CampusModule,
    AuthModule,
    UserModule,
  ],
  providers: [CampusService],
})
export class AppModule {}
