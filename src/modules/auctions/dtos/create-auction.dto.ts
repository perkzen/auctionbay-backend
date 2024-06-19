import { IsDateString, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAuctionDTO {
  @ApiProperty()
  @IsString()
  @Length(1, 64)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  description: string;

  @ApiProperty()
  @IsPositive()
  @Transform((value) => Number(value.value))
  startingPrice: number;

  @ApiProperty()
  @IsDateString()
  endsAt: Date;
}
