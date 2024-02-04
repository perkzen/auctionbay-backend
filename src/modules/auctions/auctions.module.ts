import { forwardRef, Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsJob } from './auctions.job';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadModule } from '../upload/upload.module';
import { BidsModule } from '../bids/bids.module';
import { BidsController } from '../bids/bids.controller';

@Module({
  imports: [NotificationsModule, UploadModule, forwardRef(() => BidsModule)],
  controllers: [AuctionsController, BidsController],
  providers: [AuctionsService, AuctionsJob],
  exports: [AuctionsService],
})
export class AuctionsModule {}
