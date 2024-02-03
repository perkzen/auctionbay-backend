import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { Logger } from '@nestjs/common';
import { AuctionGateway } from './auction.gateway';

const EVERY_MINUTE = 1000 * 60;

@Injectable()
export class AuctionsJob {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly auctionGateway: AuctionGateway,
  ) {}

  @Interval(EVERY_MINUTE)
  async checkAuctions() {
    const { count, wonBids } =
      await this.auctionsService.updateAuctionStatuses();
    await this.auctionGateway.notifyWinner(wonBids);
    Logger.log(`Updated statuses ${count} auctions`, 'AuctionsJob');
  }
}
