import { ApiProperty } from '@nestjs/swagger';
import { IsPositive } from 'class-validator';

export class CreateAutoBidDTO {
  @ApiProperty()
  @IsPositive()
  maxAmount: number;

  @ApiProperty()
  @IsPositive()
  incrementAmount: number;
}
