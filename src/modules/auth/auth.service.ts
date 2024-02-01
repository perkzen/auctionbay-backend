import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, SanitizedUser } from './auth.types';
import { SignupDTO } from './dtos/signup.dto';
import { comparePasswords, hashPassword, sanitizeUser } from './auth.utils';

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
    const user = await this.usersService.findOne(email);

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
    data.password = await hashPassword(data.password);
    const user = await this.usersService.create(data);
    return sanitizeUser(user);
  }
}
