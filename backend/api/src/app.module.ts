import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { PersonModule } from './modules/person/person.module';
import { CampusService } from './modules/campus/campus.service';
import { CampusModule } from './modules/campus/campus.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    PersonModule,
    CampusModule,
  ],
  providers: [CampusService],
})
export class AppModule {}
