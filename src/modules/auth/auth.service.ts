import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, JwtUser, SanitizedUser } from './types/auth.types';
import { SignupDTO } from './dtos/signup.dto';
import { comparePasswords, sanitizeUser } from './utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<SanitizedUser | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await comparePasswords(pass, user.password))) {
      return sanitizeUser(user);
    }

    return null;
  }

  async login(user: SanitizedUser) {
    const payload: JwtPayload = { email: user.email, sub: user.id };
    return {
      ...user,
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async register(data: SignupDTO) {
    const existingUser = await this.usersService.findByEmail(data.email);

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.usersService.create(data);
    return sanitizeUser(user);
  }

  async verifyToken(token: string): Promise<SanitizedUser | null> {
    const decoded: JwtPayload = await this.jwtService.verifyAsync(token);
    const user = await this.usersService.findByEmail(decoded.email);
    return user ? sanitizeUser(user) : null;
  }

  async refreshToken(user: JwtUser) {
    const payload: JwtPayload = { email: user.email, sub: user.userId };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
