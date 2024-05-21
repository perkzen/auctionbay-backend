import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsPositive, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class AutoBidDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsPositive()
  @Expose()
  incrementAmount: number;

  @ApiProperty()
  @IsPositive()
  @Expose()
  maxAmount: number;

  @ApiProperty()
  @IsString()
  @Expose()
  bidderId: string;

  @ApiProperty()
  @IsString()
  @Expose()
  auctionId: string;

  @ApiProperty()
  @IsDateString()
  @Expose()
  createdAt: Date;
}
