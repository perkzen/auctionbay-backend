import { ApiProperty } from '@nestjs/swagger';
import { BidStatus } from '@prisma/client';

export class BidDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: Object.values(BidStatus) })
  status: BidStatus;

  @ApiProperty()
  auctionId: string;

  @ApiProperty()
  bidderId: string;

  @ApiProperty()
  createdAt: Date;
}
