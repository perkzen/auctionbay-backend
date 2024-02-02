import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuctionStatus } from '@prisma/client';
import { AuctionsService } from '../auctions.service';

@Injectable()
export class BidGuard implements CanActivate {
  constructor(private readonly auctionService: AuctionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auctionId = request.params.id;
    const bidderId = request.user.userId;

    const auction = await this.auctionService.findById(auctionId);

    if (auction.status !== AuctionStatus.ACTIVE) {
      throw new BadRequestException('Auction is not active');
    }

    if (auction.ownerId === bidderId) {
      throw new BadRequestException('Owner cannot bid on their own auction');
    }

    return true;
  }
}
