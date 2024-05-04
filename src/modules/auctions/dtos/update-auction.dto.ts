import { ApiProperty } from '@nestjs/swagger';

export class UpdateAuctionDTO {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  endsAt: Date;

  imageUrl?: string;
}
