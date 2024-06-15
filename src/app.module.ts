import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuctionsModule } from './modules/auctions/auctions.module';
import { ScheduleModule } from '@nestjs/schedule';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UploadModule } from './modules/upload/upload.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BidsModule } from './modules/bids/bids.module';
import { validateEnv } from '@app/config/environment-variables/env-var.validation';
import { isTestEnv } from '@app/common/utils/env-check';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: isTestEnv() ? '.env.test' : '.env',
      isGlobal: true,
      validate: validateEnv,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    StatisticsModule,
    PrismaModule,
    AuctionsModule,
    NotificationsModule,
    UploadModule,
    BidsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
