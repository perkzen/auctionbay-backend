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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDTO } from './dtos/login.dto';
import { SignupDTO } from './dtos/signup.dto';
import { JwtUser, SanitizedUser } from './types/auth.types';
import { Public, User } from '@app/common/decorators';
import { RefreshTokenAuthGuard } from './guards/refresh-token-auth.guard';
import { RefreshTokenDTO } from './dtos/refresh-token.dto';
import { LoginResponseDTO } from './dtos/login-response.dto';
import { UserDTO } from '../users/dtos/user.dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { AuthTokensDTO } from '@app/modules/auth/dtos/auth-tokens.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: LoginResponseDTO,
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBody({ type: LoginDTO })
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@User() user: SanitizedUser) {
    const authUser = await this.authService.login(user);
    return serializeToDto(LoginResponseDTO, authUser);
  }

  @ApiOperation({ summary: 'Signup' })
  @ApiCreatedResponse({
    description: 'User registered successfully',
    type: UserDTO,
  })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @Public()
  @Post('signup')
  async signup(@Body() data: SignupDTO) {
    return this.authService.register(data);
  }

  @ApiOperation({ summary: 'Refresh token' })
  @ApiCreatedResponse({
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  @Public()
  @ApiBody({ type: RefreshTokenDTO })
  @UseGuards(RefreshTokenAuthGuard)
  @Post('refresh-token')
  async refreshToken(@User() user: JwtUser) {
    const tokens = await this.authService.refreshToken(user);
    return serializeToDto(AuthTokensDTO, tokens);
  }
}
