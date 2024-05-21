import { ApiProperty } from '@nestjs/swagger';
import { UserDTO } from '../../users/dtos/user.dto';
import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class LoginResponseDTO extends UserDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  accessToken: string;

  @ApiProperty()
  @IsString()
  @Expose()
  refreshToken: string;
}
