import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtUser } from '../auth/auth.types';
import { sanitizeUser } from '../auth/auth.utils';
import { User } from 'src/common/decorators/user.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@User() user: JwtUser) {
    return sanitizeUser(await this.usersService.findOne(user.email));
  }
}
