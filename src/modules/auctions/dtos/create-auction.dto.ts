import { IsDate, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateAuctionDTO {
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
  @Transform((value) => Number(value.value))
  startingPrice: number;

  @ApiProperty()
  @IsDate()
  endsAt: Date;
}
