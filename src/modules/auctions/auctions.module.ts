import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { AuctionsJob } from './auctions.job';

@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionsJob],
})
export class AuctionsModule {}
