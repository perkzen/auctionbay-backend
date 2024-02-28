import { BadRequestException, Injectable } from '@nestjs/common';
import { BidsService } from './bids.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AuctionEvents } from '../../auctions/events/auction.events';
import { NewBidEvent } from '../events/new-bid.event';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAutoBidDTO } from '../dtos/create-auto-bid.dto';
import { Bid } from '@prisma/client';
import { AuctionsService } from '../../auctions/services/auctions.service';

@Injectable()
export class AutoBidService {
  constructor(
    private readonly db: PrismaService,
    private readonly bidsService: BidsService,
    private readonly auctionService: AuctionsService,
  ) {}

  @OnEvent(AuctionEvents.NEW_BID)
  async handleNewBidEvent(payload: NewBidEvent) {
    const { auctionId, amount, bidderId } = payload;

    const lastBid = await this.bidsService.findLastBid(auctionId);

    const autoBids = await this.findValidAutoBids(
      auctionId,
      lastBid.bidderId,
      lastBid.amount,
    );

    for (const autoBid of autoBids) {
      await this.autoBid(
        auctionId,
        autoBid.bidderId,
        autoBid.incrementAmount,
        autoBid.maxAmount,
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
      // TODO this check need to happen in bids service
      if (lastBid.amount >= autoBidAmount) {
        return null;
      }

      if (lastBid.bidderId === bidderId) {
        return null;
      }
    }

    return this.bidsService.create(auctionId, bidderId, autoBidAmount);
  }

  async create(auctionId: string, bidderId: string, data: CreateAutoBidDTO) {
    if (data.maxAmount <= data.incrementAmount) {
      throw new BadRequestException(
        'Max amount should be greater than increment amount.',
      );
    }

    return this.db.autoBid.create({
      data: {
        auctionId,
        bidderId,
        maxAmount: data.maxAmount,
        incrementAmount: data.incrementAmount,
      },
    });
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
