import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';
import { Logger } from '@nestjs/common';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class AuctionsJob {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly notifications: NotificationsGateway,
  ) {}

  @Cron('* * * * *')
  async checkAuctions() {
    const { count, wonBids: wonBidsIds } =
      await this.auctionsService.updateAuctionStatuses();

    const wonBids = await this.auctionsService.findWonBids(wonBidsIds);

    await this.notifications.notifyWinners(wonBids);
    Logger.log(`Closed ${count} auctions`, 'AuctionsJob');
  }
}
