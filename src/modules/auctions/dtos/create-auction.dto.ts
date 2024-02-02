import { IsDecimal, IsPositive, IsString, Length } from 'class-validator';

export class CreateAuctionDTO {
  @IsString()
  imageUrl: string;

  @IsString()
  @Length(1, 64)
  title: string;

  @IsString()
  @Length(1, 255)
  description: string;

  @IsDecimal()
  @IsPositive()
  startingPrice: number;

  @IsPositive()
  duration: number;
}
