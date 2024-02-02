import { Module } from '@nestjs/common';
import { AuctionsController } from './auctions.controller';
import { Auctions } from './auctions';
import { AuctionsService } from './auctions.service';

@Module({
  controllers: [AuctionsController],
  providers: [Auctions, AuctionsService]
})
export class AuctionsModule {}
