import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { Logger } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { BidsService } from '../bids/bids.service';

@Injectable()
export class AuctionsJob {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly notifications: NotificationsGateway,
    private readonly bidsService: BidsService,
  ) {}

  @Cron('* * * * *')
  async checkAuctions() {
    const { count, wonBids: wonBidsIds } =
      await this.auctionsService.updateAuctionStatuses();

    const wonBids = await this.bidsService.findWonBids(wonBidsIds);

    await this.notifications.notifyWinners(wonBids);
    Logger.log(`Closed ${count} auctions`, 'AuctionsJob');
  }
}
