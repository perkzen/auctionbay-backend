import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus, BidStatus } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

class Bid {
  @ApiProperty({ enum: Object.values(BidStatus) })
  @Expose()
  @IsEnum(BidStatus)
  status: BidStatus;

  @ApiProperty()
  @Expose()
  @IsPositive()
  amount: number;

  @ApiProperty()
  @Expose()
  @IsString()
  bidderId: string;
}

export class AuctionListDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  title: string;

  @ApiProperty()
  @IsUrl()
  @Expose()
  imageUrl: string;

  @ApiProperty({
    enum: Object.values(AuctionStatus),
  })
  @IsEnum(AuctionStatus)
  @Expose()
  status: AuctionStatus;

  @ApiProperty()
  @IsDateString()
  @Expose()
  endsAt: Date;

  @ApiProperty()
  @IsPositive()
  @Expose()
  startingPrice: number;

  @ApiProperty()
  @IsString()
  @Expose()
  ownerId: string;

  @ApiProperty()
  @Expose()
  closedPrice: number | null;

  @ApiProperty({
    isArray: true,
    type: Bid,
  })
  @Expose()
  @IsArray()
  bids: Bid[];
}
