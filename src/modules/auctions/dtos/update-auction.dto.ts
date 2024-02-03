import { CreateAuctionDTO } from './create-auction.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AuctionStatus } from '@prisma/client';

export class UpdateAuctionDTO extends PartialType(CreateAuctionDTO) {
  @ApiProperty({ required: false })
  @IsEnum(AuctionStatus, {
    message: 'Invalid status',
  })
  status?: AuctionStatus;
}
