import { forwardRef, Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions.controller';
import { AuctionsService } from './services/auctions.service';
import { AuctionsJob } from './jobs/auctions.job';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadModule } from '../upload/upload.module';
import { UserAuctionsController } from './controllers/user-auctions.controller';
import { BidsModule } from '../bids/bids.module';

@Module({
  imports: [NotificationsModule, UploadModule, forwardRef(() => BidsModule)],
  controllers: [UserAuctionsController, AuctionsController],
  providers: [AuctionsService, AuctionsJob],
  exports: [AuctionsService],
})
export class AuctionsModule {}
