import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuctionsService } from '../services/auctions.service';
import { Logger } from '@nestjs/common';
import { BidsService } from '../services/bids.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class AuctionsJob {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly notificationsService: NotificationsService,
    private readonly bidsService: BidsService,
  ) {}

  @Cron('* * * * *')
  async checkAuctions() {
    const { count, closedAuctions } =
      await this.auctionsService.updateAuctionStatuses();

    Logger.log(`Closed ${count} auctions`, 'AuctionsJob');

    if (count === 0) return;

    for (const auction of closedAuctions) {
      const bids = await this.bidsService.findLastBidsByEachUser(auction.id);
      await this.notificationsService.sendAuctionClosedNotification(
        auction.id,
        bids,
      );
    }
  }
}
