import { IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBidDTO {
  @ApiProperty()
  @IsPositive()
  amount: number;
}
