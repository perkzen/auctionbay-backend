import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDTO } from './dtos/login.dto';
import { SignupDTO } from './dtos/signup.dto';
import { JwtUser, SanitizedUser } from './types/auth.types';
import { Public, User } from '../../common/decorators';
import { RefreshTokenAuthGuard } from './guards/refresh-token-auth.guard';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiBody({ type: LoginDTO })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: SanitizedUser) {
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Signup' })
  @Public()
  @Post('signup')
  async signup(@Body() data: SignupDTO) {
    return this.authService.register(data);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @Public()
  @ApiBody({ type: RefreshTokenDTO })
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh-token')
  async refreshToken(@User() user: JwtUser) {
    return this.authService.refreshToken(user);
  }
}
