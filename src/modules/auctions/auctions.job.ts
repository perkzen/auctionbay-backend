import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { Logger } from '@nestjs/common';

const EVERY_MINUTE = 1000 * 60;

@Injectable()
export class AuctionsJob {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Interval(EVERY_MINUTE)
  async checkAuctions() {
    const count = await this.auctionsService.updateAuctionStatuses();
    Logger.log(`Updated statuses ${count} auctions`, 'AuctionsJob');
  }
}
