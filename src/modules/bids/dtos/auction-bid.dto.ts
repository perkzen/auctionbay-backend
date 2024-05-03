import { ApiProperty } from '@nestjs/swagger';

class Bidder {
  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  imageUrl: string;
}

export class AuctionBidDTO {
  @ApiProperty({
    type: Bidder,
  })
  bidder: Bidder;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  createdAt: Date;
}
