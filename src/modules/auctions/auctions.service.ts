import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { Auction, AuctionStatus, Bid, BidStatus } from '@prisma/client';
import { UpdateAuctionDTO } from './dtos/update-auction.dto';

@Injectable()
export class AuctionsService {
  constructor(private readonly db: PrismaService) {}

  async create(data: CreateAuctionDTO, ownerId: string): Promise<Auction> {
    return this.db.auction.create({
      data: {
        ...data,
        status: AuctionStatus.ACTIVE,
        ownerId,
      },
    });
  }

  async update(data: UpdateAuctionDTO, auctionId: string) {
    return this.db.auction.update({
      where: {
        id: auctionId,
      },
      data,
    });
  }

  async list(): Promise<Auction[]> {
    return this.db.auction.findMany({
      where: {
        status: AuctionStatus.ACTIVE,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string): Promise<Auction> {
    const auction = await this.db.auction.findUnique({
      where: {
        id,
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction;
  }

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

  async bid(auctionId: string, bidderId: string, amount: number): Promise<Bid> {
    const lastBid = await this.findLastBid(auctionId);

    if (lastBid?.amount >= amount) {
      throw new BadRequestException(
        'Bid amount must be greater than the last bid',
      );
    }

    if (lastBid?.bidderId === bidderId) {
      throw new BadRequestException('You are already the highest bidder');
    }

    return this.db.$transaction(async (tx) => {
      const bid = await tx.bid.create({
        data: {
          amount,
          status: BidStatus.WINNING,
          auctionId,
          bidderId,
        },
      });

      await tx.bid.updateMany({
        where: {
          auctionId,
          id: {
            not: bid.id,
          },
        },
        data: {
          status: BidStatus.OUTBID,
        },
      });

      return bid;
    });
  }

  async updateAuctionStatuses() {
    return this.db.$transaction(async (tx) => {
      const updatedCount = (
        await tx.auction.updateMany({
          where: {
            status: AuctionStatus.ACTIVE,
            endsAt: {
              lte: new Date(),
            },
          },
          data: {
            status: AuctionStatus.CLOSED,
          },
        })
      ).count;

      const closedAuctions = await tx.auction.findMany({
        where: {
          status: AuctionStatus.CLOSED,
          bids: {
            none: {
              status: BidStatus.WON,
            },
          },
        },
        include: {
          bids: {
            orderBy: {
              amount: 'desc',
            },
            take: 1,
          },
        },
      });

      const lastBids = closedAuctions
        .map((auction) => auction.bids[0]?.id)
        .filter(Boolean);

      await tx.bid.updateMany({
        where: {
          id: {
            in: lastBids,
          },
        },
        data: {
          status: BidStatus.WON,
        },
      });

      return { count: updatedCount, wonBids: lastBids, closedAuctions };
    });
  }

  async findWonBids(wonBids: string[]) {
    return this.db.bid.findMany({
      where: {
        id: {
          in: wonBids,
        },
      },
      select: {
        id: true,
        amount: true,
        bidder: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
          },
        },
        auction: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
