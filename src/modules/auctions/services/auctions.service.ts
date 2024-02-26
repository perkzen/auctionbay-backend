import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuctionDTO } from '../dtos/create-auction.dto';
import { Auction, AuctionStatus, BidStatus } from '@prisma/client';
import { UpdateAuctionDTO } from '../dtos/update-auction.dto';
import { UploadService } from '../../upload/upload.service';
import { BidsService } from './bids.service';

@Injectable()
export class AuctionsService {
  constructor(
    private readonly db: PrismaService,
    private readonly uploadService: UploadService,
    private readonly bidsService: BidsService,
  ) {}

  async create(
    data: CreateAuctionDTO,
    ownerId: string,
    image: Express.Multer.File,
  ) {
    const imageUrl = await this.uploadService.upload(image);

    if (!imageUrl) {
      throw new BadRequestException('Failed to create auction');
    }

    return this.db.auction.create({
      data: {
        ...data,
        imageUrl: imageUrl,
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

  async findByUserId(userId: string): Promise<Auction[]> {
    return this.db.auction.findMany({
      where: {
        ownerId: userId,
      },
    });
  }

  async findWonAuctionsByUserId(userId: string): Promise<Auction[]> {
    return this.db.auction.findMany({
      where: {
        status: AuctionStatus.CLOSED,
        bids: {
          some: {
            status: BidStatus.WON,
            bidderId: userId,
          },
        },
      },
    });
  }

  async findBiddingAuctionsByUserId(userId: string): Promise<Auction[]> {
    return this.db.auction.findMany({
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

  async updateAuctionStatuses() {
    return this.db.$transaction(async (tx) => {
      const closeBids = async (): Promise<number> => {
        const dueAuctions = await tx.auction.findMany({
          where: {
            status: AuctionStatus.ACTIVE,
            endsAt: {
              lte: new Date(),
            },
          },
          select: {
            id: true,
          },
        });

        await Promise.all(
          dueAuctions.map(async (auction) => {
            const wonBid = await this.bidsService.findLastBid(auction.id);

            return tx.auction.update({
              where: {
                id: auction.id,
              },
              data: {
                status: AuctionStatus.CLOSED,
                closedPrice: wonBid?.amount || 0,
              },
            });
          }),
        );

        return dueAuctions.length;
      };

      const findClosedAuctions = async () => {
        return tx.auction.findMany({
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
      };

      const setWonBids = async (wonBids: string[]) => {
        await tx.bid.updateMany({
          where: {
            id: {
              in: wonBids,
            },
          },
          data: {
            status: BidStatus.WON,
          },
        });
      };

      const numberOfClosedBids = await closeBids();

      const closedAuctions = await findClosedAuctions();

      const lastBids = closedAuctions
        .map((auction) => auction.bids[0]?.id)
        .filter(Boolean);

      await setWonBids(lastBids);

      return { count: numberOfClosedBids, wonBids: lastBids, closedAuctions };
    });
  }
}
