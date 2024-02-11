import { Body, Controller, Get, HttpStatus, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { sanitizeUser } from '../auth/utils/auth.utils';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { User } from '../../common/decorators';
import { UpdateProfileDTO } from './dtos/update-profile.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @Get('me')
  async me(@User('email') email: string) {
    return sanitizeUser(await this.usersService.findByEmail(email));
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
  })
  @Put('me')
  async updateProfile(
    @Body() data: UpdateProfileDTO,
    @User('email') email: string,
  ) {
    return this.usersService.updateProfile(data, email);
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated successfully',
  })
  @Put('me/update-password')
  async changePassword(
    @Body() data: UpdatePasswordDTO,
    @User('email') email: string,
  ) {
    return this.usersService.updatePassword(data, email);
  }
}
