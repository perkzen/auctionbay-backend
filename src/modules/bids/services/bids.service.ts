import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuctionStatus, Bid, BidStatus } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NewBidEventPayload } from '../events/new-bid.event';
import { AuctionsService } from '../../auctions/services/auctions.service';
import { AuctionEvent } from '../../auctions/events/auctionEvent';

@Injectable()
export class BidsService {
  private readonly logger = new Logger(BidsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => AuctionsService))
    private readonly auctionService: AuctionsService,
  ) {}

  async findLastBid(auctionId: string): Promise<Bid> {
    return this.db.bid.findFirst({
      where: {
        auctionId,
      },
      orderBy: {
        amount: 'desc',
      },
    });
  }

  private async validateBid(
    auctionId: string,
    bidderId: string,
    amount: number,
  ) {
    let errors: string[] = [];

    const auction = await this.auctionService.findById(auctionId);

    if (auction.status !== AuctionStatus.ACTIVE) {
      errors.push('Auction is not active');
    }

    if (auction.ownerId === bidderId) {
      errors.push('Owner cannot bid on their own auction');
    }

    if (auction.startingPrice > amount) {
      errors.push('Bid amount must be greater than the starting price');
    }

    const lastBid = await this.findLastBid(auctionId);

    if (lastBid?.amount >= amount) {
      errors.push('Bid amount must be greater than the last bid');
    }

    if (lastBid?.bidderId === bidderId) {
      errors.push('You are already the highest bidder');
    }

    return { ok: errors.length === 0, errors };
  }

  async create(auctionId: string, bidderId: string, amount: number) {
    const result = await this.validateBid(auctionId, bidderId, amount);

    if (!result.ok) {
      throw new BadRequestException(result.errors.join(', '));
    }

    return this.db.$transaction(async (tx) => {
      const createBid = async (
        amount: number,
        auctionId: string,
        bidderId: string,
      ) => {
        return tx.bid.create({
          data: {
            amount,
            status: BidStatus.WINNING,
            auctionId,
            bidderId,
          },
        });
      };

      const updateBidStatuses = async (winningBidId: string) => {
        await tx.bid.updateMany({
          where: {
            auctionId,
            id: {
              not: winningBidId,
            },
          },
          data: {
            status: BidStatus.OUTBID,
          },
        });
      };

      const bid = await createBid(amount, auctionId, bidderId);

      await updateBidStatuses(bid.id);

      this.eventEmitter.emit(
        AuctionEvent.NEW_BID,
        new NewBidEventPayload(auctionId, bidderId, amount),
      );

      this.logger.log(`New bid on auction ${auctionId} by ${bidderId}`);

      return bid;
    });
  }

  async findLastBidsByEachUser(auctionId: string) {
    return this.db.bid.findMany({
      where: {
        auctionId,
        auction: {
          status: AuctionStatus.CLOSED,
        },
      },
      select: {
        id: true,
        bidderId: true,
        status: true,
        amount: true,
        auction: {
          select: {
            title: true,
            id: true,
            imageUrl: true,
          },
        },
      },
      distinct: ['bidderId'],
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
