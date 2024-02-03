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
    const { count, wonBids } =
      await this.auctionsService.updateAuctionStatuses();
    await this.notifications.notifyWinner(wonBids);
    Logger.log(`Updated statuses ${count} auctions`, 'AuctionsJob');
  }
}
