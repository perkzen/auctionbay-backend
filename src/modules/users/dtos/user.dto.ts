import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UserDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsString()
  @Expose()
  email: string;

  @ApiProperty()
  @IsString()
  @Expose()
  firstname: string;

  @ApiProperty()
  @IsString()
  @Expose()
  lastname: string;

  @ApiProperty()
  @IsString()
  @Expose()
  imageUrl: string;

  @ApiProperty()
  @IsString()
  @IsDateString()
  createdAt: Date;
}
