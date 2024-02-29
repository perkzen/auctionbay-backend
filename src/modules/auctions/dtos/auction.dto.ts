import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  status: string;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  createdAt: Date;
}
