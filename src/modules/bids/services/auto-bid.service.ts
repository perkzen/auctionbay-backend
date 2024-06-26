import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BidsService } from './bids.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { AuctionEvent } from '../../auctions/events/auctionEvent';
import { NewBidEventPayload } from '../dtos/new-bid-event-payload';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAutoBidDTO } from '../dtos/create-auto-bid.dto';
import { Bid } from '@prisma/client';
import { AuctionsService } from '../../auctions/services/auctions.service';

@Injectable()
export class AutoBidService {
  private readonly logger = new Logger(AutoBidService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly bidsService: BidsService,
    private readonly auctionService: AuctionsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(AuctionEvent.NEW_BID)
  async handleNewBidEvent(payload: NewBidEventPayload) {
    this.logger.log('New bid event received');

    const { auctionId, amount, bidderId } = payload;

    const autoBids = await this.findValidAutoBids(auctionId, bidderId, amount);

    for (const autoBid of autoBids) {
      const newBid = await this.autoBid(
        auctionId,
        autoBid.bidderId,
        autoBid.incrementAmount,
        autoBid.maxAmount,
      );

      newBid &&
        this.logger.log(
          `Auto-bid placed for bidder ${newBid.bidderId} on auction ${newBid.auctionId} with amount ${newBid.amount}`,
        );
    }
  }

  async autoBid(
    auctionId: string,
    bidderId: string,
    incrementAmount: number,
    maxAmount: number,
  ): Promise<Bid | null> {
    let autoBidAmount: number;

    // check last bid again because it might have changed
    const lastBid = await this.bidsService.findLastBid(auctionId);

    if (!lastBid) {
      try {
        const auction = await this.auctionService.findById(auctionId);
        autoBidAmount = auction.startingPrice;
      } catch (e) {
        return null;
      }
    } else {
      autoBidAmount = Math.min(lastBid.amount + incrementAmount, maxAmount);
    }

    try {
      return await this.bidsService.create(auctionId, bidderId, autoBidAmount);
    } catch (e) {
      return null;
    }
  }

  async create(auctionId: string, bidderId: string, data: CreateAutoBidDTO) {
    if (data.maxAmount <= data.incrementAmount) {
      throw new BadRequestException(
        'Max amount should be greater than increment amount.',
      );
    }

    const autoBid = await this.db.autoBid.create({
      data: {
        auctionId,
        bidderId,
        maxAmount: data.maxAmount,
        incrementAmount: data.incrementAmount,
      },
    });

    this.eventEmitter.emit(
      AuctionEvent.NEW_BID,
      new NewBidEventPayload(auctionId, bidderId, data.maxAmount),
    );

    return autoBid;
  }

  async findValidAutoBids(auctionId: string, bidderId: string, amount: number) {
    return this.db.autoBid.findMany({
      where: {
        auctionId,
        bidderId: {
          not: bidderId,
        },
        maxAmount: {
          gte: amount,
        },
      },
    });
  }
}
