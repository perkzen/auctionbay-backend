import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class AuctionDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsUrl()
  @Expose()
  imageUrl: string;

  @ApiProperty()
  @IsString()
  @Expose()
  title: string;

  @ApiProperty()
  @IsString()
  @Expose()
  description: string;

  @ApiProperty()
  @IsPositive()
  @Expose()
  startingPrice: number;

  @ApiProperty()
  @IsPositive()
  @Expose()
  closedPrice: number;

  @ApiProperty({
    enum: Object.values(AuctionStatus),
  })
  @Expose()
  @IsEnum(AuctionStatus)
  status: AuctionStatus;

  @ApiProperty()
  @IsDateString()
  @Expose()
  endsAt: Date;

  @ApiProperty()
  @IsString()
  @Expose()
  ownerId: string;

  @ApiProperty()
  @Expose()
  @IsDateString()
  createdAt: Date;
}
