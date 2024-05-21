import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class AuthTokensDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @IsString()
  @Expose()
  refreshToken: string;
}
