import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus, BidStatus } from '@prisma/client';

class Bid {
  @ApiProperty({ enum: Object.values(BidStatus) })
  status: BidStatus;

  @ApiProperty()
  amount: number;
}

export class AuctionListDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty({
    enum: Object.values(AuctionStatus),
  })
  status: AuctionStatus;

  @ApiProperty()
  endsAt: Date;

  @ApiProperty()
  startingPrice: number;

  @ApiProperty({
    isArray: true,
    type: Bid,
  })
  bids: Bid[];
}
