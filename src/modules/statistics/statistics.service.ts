import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionStatus, BidStatus } from '@prisma/client';

@Injectable()
export class StatisticsService {
  constructor(private readonly db: PrismaService) {}

  async earningsByUser(userId: string) {
    return (
      (
        await this.db.auction.aggregate({
          where: {
            ownerId: userId,
            status: AuctionStatus.CLOSED,
          },
          _sum: {
            closedPrice: true,
          },
        })
      )._sum.closedPrice || 0
    );
  }

  async postedAuctionsByUser(userId: string) {
    return this.db.auction.count({
      where: {
        ownerId: userId,
      },
    });
  }

  async activeBidsByUser(userId: string) {
    return this.db.auction.count({
      where: {
        status: AuctionStatus.ACTIVE,
        bids: {
          some: {
            bidderId: userId,
          },
        },
      },
    });
  }

  async currentlyWinningBidsByUser(userId: string) {
    return this.db.bid.count({
      where: {
        bidderId: userId,
        status: BidStatus.WINNING,
        auction: {
          status: AuctionStatus.ACTIVE,
        },
      },
    });
  }
}
