import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus } from '@prisma/client';

export class AuctionDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  startingPrice: number;

  @ApiProperty()
  closedPrice: number;

  @ApiProperty({
    enum: Object.values(AuctionStatus),
  })
  status: AuctionStatus;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  createdAt: Date;
}
