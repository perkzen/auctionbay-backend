import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsJob } from './auctions.job';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
  exports: [AuctionsService],
})
export class AuctionsModule {}
