import { ApiProperty } from '@nestjs/swagger';

export class BidDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  auctionId: string;

  @ApiProperty()
  bidderId: string;

  @ApiProperty()
  createdAt: Date;
}
