import { forwardRef, Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsJob } from './auctions.job';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
  exports: [AuctionsService],
})
export class AuctionsModule {}
