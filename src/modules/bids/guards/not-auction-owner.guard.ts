import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuctionOwnerGuard } from '../../auctions/guards/auction-owner.guard';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotAuctionOwnerGuard {
  constructor(private readonly db: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auctionId = request.params.id;
    const userId = request.user.userId;

    const auction = await this.db.auction.findUnique({
      where: {
        id: auctionId,
        ownerId: userId,
      },
    });

    if (auction) {
      throw new UnauthorizedException(
        'You are the owner of this auction, you cannot bid on it.',
      );
    }

    return true;
  }
}
