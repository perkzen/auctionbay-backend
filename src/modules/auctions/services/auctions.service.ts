import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuctionDTO } from '../dtos/create-auction.dto';
import { Auction, AuctionStatus, BidStatus } from '@prisma/client';
import { UpdateAuctionDTO } from '../dtos/update-auction.dto';
import { UploadService } from '../../upload/upload.service';
import { BidsService } from '../../bids/services/bids.service';
import { AuctionListDTO } from '../dtos/auction-list.dto';

@Injectable()
export class AuctionsService {
  private readonly logger = new Logger(AuctionsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly uploadService: UploadService,
    @Inject(forwardRef(() => BidsService))
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

    try {
      return this.db.auction.create({
        data: {
          ...data,
          imageUrl: imageUrl,
          status: AuctionStatus.ACTIVE,
          ownerId,
        },
      });
    } catch (e) {
      await this.uploadService.delete(imageUrl);
      this.logger.error(e);
    }
  }

  async update(
    data: UpdateAuctionDTO,
    auctionId: string,
    image?: Express.Multer.File,
  ) {
    let imageUrl: string;

    if (image) {
      const auction = await this.findById(auctionId);

      await this.uploadService.delete(auction.imageUrl);

      imageUrl = await this.uploadService.upload(image);

      if (!imageUrl) {
        throw new BadRequestException('Failed to update auction');
      }
    }

    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    return this.db.auction.update({
      where: {
        id: auctionId,
      },
      data,
    });
  }

  async list(): Promise<AuctionListDTO[]> {
    return this.db.auction.findMany({
      where: {
        status: AuctionStatus.ACTIVE,
      },
      orderBy: {
        endsAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        status: true,
        endsAt: true,
        startingPrice: true,
        bids: {
          orderBy: {
            amount: 'desc',
          },
          select: {
            status: true,
            amount: true,
            bidderId: true,
          },
          take: 1,
        },
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

  async findByUserId(userId: string): Promise<AuctionListDTO[]> {
    return this.db.auction.findMany({
      where: {
        ownerId: userId,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        status: true,
        endsAt: true,
        startingPrice: true,
        ownerId: true,
        createdAt: true,
        description: true,
        closedPrice: true,
        bids: {
          orderBy: {
            amount: 'desc',
          },
          select: {
            status: true,
            amount: true,
            bidderId: true,
          },
          take: 1,
        },
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

  async findBiddingAuctionsByUserId(userId: string): Promise<AuctionListDTO[]> {
    return this.db.auction.findMany({
      where: {
        status: AuctionStatus.ACTIVE,
        bids: {
          some: {
            bidderId: userId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        status: true,
        endsAt: true,
        startingPrice: true,
        ownerId: true,
        createdAt: true,
        description: true,
        closedPrice: true,
        bids: {
          orderBy: {
            amount: 'desc',
          },
          select: {
            status: true,
            amount: true,
            bidderId: true,
          },
          take: 1,
        },
      },
    });
  }

  async updateAuctionStatuses() {
    return this.db.$transaction(async (tx) => {
      const closeBids = async () => {
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

        return {
          count: dueAuctions.length,
          auctions: dueAuctions,
        };
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

      const { auctions, count } = await closeBids();

      // could do better
      const closedAuctions = await findClosedAuctions();

      const lastBids = closedAuctions
        .map((auction) => auction.bids[0]?.id)
        .filter(Boolean);

      await setWonBids(lastBids);

      return { count, auctions };
    });
  }

  async delete(id: string) {
    const foundAuction = await this.findById(id);

    return this.db.auction.delete({
      where: {
        id: foundAuction.id,
      },
    });
  }
}
