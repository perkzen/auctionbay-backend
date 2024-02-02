import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { Auction, AuctionStatus } from '@prisma/client';
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
}
