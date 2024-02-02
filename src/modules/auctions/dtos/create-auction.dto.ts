import { IsDecimal, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsPositive()
  duration: number;
}
