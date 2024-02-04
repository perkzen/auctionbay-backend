import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuctionStatus } from '@prisma/client';
import { AuctionsService } from '../../auctions/auctions.service';
import { CreateBidDTO } from '../../auctions/dtos/create-bid.dto';
import { BidsService } from '../bids.service';

@Injectable()
export class CanBidGuard implements CanActivate {
  constructor(
    private readonly auctionService: AuctionsService,
    private readonly bidsService: BidsService,
  ) {}

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

    const { amount } = request.body as CreateBidDTO;

    const lastBid = await this.bidsService.findLastBid(auctionId);

    if (lastBid?.amount >= amount) {
      throw new BadRequestException(
        'Bid amount must be greater than the last bid',
      );
    }

    if (lastBid?.bidderId === bidderId) {
      throw new BadRequestException('You are already the highest bidder');
    }

    return true;
  }
}
