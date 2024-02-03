import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsJob } from './auctions.job';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [NotificationsModule, UploadModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
  exports: [AuctionsService],
})
export class AuctionsModule {}
