import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsPositive, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

class Bidder {
  @ApiProperty()
  @IsString()
  @Expose()
  firstname: string;

  @ApiProperty()
  @IsString()
  @Expose()
  lastname: string;

  @ApiProperty()
  @IsString()
  @Expose()
  imageUrl: string;
}

export class AuctionBidDTO {
  @ApiProperty({
    type: Bidder,
  })
  bidder: Bidder;

  @ApiProperty()
  @IsPositive()
  @Expose()
  amount: number;

  @ApiProperty()
  @IsDateString()
  @Expose()
  createdAt: Date;
}
