import { forwardRef, Module } from '@nestjs/common';
import { BidsService } from './bids.service';
import { CanBidGuard } from './guards/can-bid.guard';
import { AuctionsModule } from '../auctions/auctions.module';
import { BidsController } from './bids.controller';

@Module({
  imports: [forwardRef(() => AuctionsModule)],
  providers: [BidsService, BidsController, CanBidGuard],
  exports: [BidsService, BidsController],
})
export class BidsModule {}
