import { forwardRef, Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './services/bids.service';
import { AutoBidService } from './services/auto-bid.service';
import { AuctionsModule } from '../auctions/auctions.module';
import { BidsGateway } from './gateway/bids.gateway';

@Module({
  imports: [forwardRef(() => AuctionsModule)],
  controllers: [BidsController],
  providers: [BidsService, AutoBidService, BidsGateway],
  exports: [BidsService, AutoBidService],
})
export class BidsModule {}
