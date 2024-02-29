import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuctionsService } from '../services/auctions.service';
import { Logger } from '@nestjs/common';
import { BidsService } from '../../bids/services/bids.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class AuctionsJob {
  private readonly logger = new Logger(AuctionsJob.name);

  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly notificationsService: NotificationsService,
    private readonly bidsService: BidsService,
  ) {}

  @Cron('* * * * *')
  async checkAuctions() {
    const { count, auctions } =
      await this.auctionsService.updateAuctionStatuses();

    this.logger.log(`Closed ${count} auctions`);

    for (const auction of auctions) {
      const bids = await this.bidsService.findLastBidsByEachUser(auction.id);
      await this.notificationsService.sendAuctionClosedNotification(
        auction.id,
        bids,
      );
    }
  }
}
