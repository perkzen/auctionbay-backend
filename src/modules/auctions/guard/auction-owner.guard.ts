import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuctionOwner implements CanActivate {
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

    if (!auction) {
      throw new UnauthorizedException(
        'You do not have permission for this auction.',
      );
    }

    return true;
  }
}
