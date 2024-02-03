import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, SanitizedUser } from './auth.types';
import { SignupDTO } from './dtos/signup.dto';
import { comparePasswords, sanitizeUser } from './auth.utils';

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

  async login({ email, id }: SanitizedUser) {
    const payload: JwtPayload = { email, sub: id };
    return {
      access_token: await this.jwtService.signAsync(payload),
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
}
