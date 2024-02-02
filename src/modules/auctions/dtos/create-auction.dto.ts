import { IsDate, IsEnum, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuctionStatus } from '@prisma/client';

export class CreateAuctionDTO {
  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty()
  @IsString()
  @Length(1, 64)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 255)
  description: string;

  @ApiProperty()
  @IsPositive()
  startingPrice: number;

  @ApiProperty()
  @IsDate()
  endsAt: Date;

  @ApiProperty({ required: false })
  @IsEnum(AuctionStatus, {
    message: 'Invalid status',
  })
  status?: AuctionStatus;
}
