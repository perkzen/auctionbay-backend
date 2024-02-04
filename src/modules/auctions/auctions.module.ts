import { Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions.controller';
import { AuctionsService } from './services/auctions.service';
import { AuctionsJob } from './jobs/auctions.job';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadModule } from '../upload/upload.module';
import { BidsController } from './controllers/bids.controller';
import { BidsService } from './services/bids.service';

@Module({
  imports: [NotificationsModule, UploadModule],
  controllers: [AuctionsController, BidsController],
  providers: [AuctionsService, AuctionsJob, BidsService],
})
export class AuctionsModule {}
