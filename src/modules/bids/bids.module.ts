import { forwardRef, Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './services/bids.service';
import { AutoBidService } from './services/auto-bid.service';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [forwardRef(() => AuctionsModule)],
  controllers: [BidsController],
  providers: [BidsService, AutoBidService],
  exports: [BidsService, AutoBidService],
})
export class BidsModule {}
