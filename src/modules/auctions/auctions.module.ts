import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsJob } from './auctions.job';
import { AuctionGateway } from './auction.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob, AuctionGateway],
})
export class AuctionsModule {}
