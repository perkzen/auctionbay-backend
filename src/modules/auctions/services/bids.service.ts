import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WonBid } from '../types/won-bid.type';
import { Bid, BidStatus } from '@prisma/client';

@Injectable()
export class BidsService {
  constructor(private readonly db: PrismaService) {}

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

  async create(auctionId: string, bidderId: string, amount: number) {
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

      return bid;
    });
  }

  async findWonBids(wonBids: string[]): Promise<WonBid[]> {
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
