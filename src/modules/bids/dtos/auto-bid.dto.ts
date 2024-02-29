import { ApiProperty } from '@nestjs/swagger';

export class AutoBidDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  incrementAmount: number;

  @ApiProperty()
  maxAmount: number;

  @ApiProperty()
  bidderId: string;

  @ApiProperty()
  auctionId: string;

  @ApiProperty()
  createdAt: Date;
}
