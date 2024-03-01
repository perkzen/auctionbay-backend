import { forwardRef, Module } from '@nestjs/common';
import { BidsController } from './bids.controller';
import { BidsService } from './services/bids.service';
import { AutoBidService } from './services/auto-bid.service';
import { AuctionsModule } from '../auctions/auctions.module';
import { BidsGateway } from './gateway/bids.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuctionsModule), AuthModule],
  controllers: [BidsController],
  providers: [BidsGateway, BidsService, AutoBidService],
  exports: [BidsService, AutoBidService],
})
export class BidsModule {}
