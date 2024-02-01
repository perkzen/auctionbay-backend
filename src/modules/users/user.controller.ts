import { Body, Controller, Get, HttpStatus, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtUser } from '../auth/auth.types';
import { sanitizeUser } from '../auth/auth.utils';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { User } from '../../common/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @Get('me')
  async me(@User() user: JwtUser) {
    return sanitizeUser(await this.usersService.findByEmail(user.email));
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated successfully',
  })
  @Put('update-password')
  async changePassword(
    @Body() data: UpdatePasswordDTO,
    @User('email') email: string,
  ) {
    return this.usersService.updatePassword(data, email);
  }
}
