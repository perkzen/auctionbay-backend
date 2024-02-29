import { ApiProperty } from '@nestjs/swagger';
import { UserDTO } from '../../users/dtos/user.dto';

export class LoginResponseDTO extends UserDTO {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
