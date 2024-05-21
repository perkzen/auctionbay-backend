import { ApiProperty } from '@nestjs/swagger';
import { BidStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsPositive, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class BidDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsPositive()
  @Expose()
  amount: number;

  @ApiProperty({ enum: Object.values(BidStatus) })
  @IsEnum(BidStatus)
  @Expose()
  status: BidStatus;

  @ApiProperty()
  @IsString()
  @Expose()
  auctionId: string;

  @ApiProperty()
  @IsString()
  @Expose()
  bidderId: string;

  @ApiProperty()
  @IsDateString()
  @Expose()
  createdAt: Date;
}
