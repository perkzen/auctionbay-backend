import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { SanitizedUser } from './auth.types';
import { SignupDto } from './dtos/signup.dto';
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

    const isCorrectPassword = await comparePasswords(pass, user.password);

    if (user && isCorrectPassword) {
      return sanitizeUser(user);
    }

    return null;
  }

  async login({ email, id }: SanitizedUser) {
    const payload = { username: email, sub: id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(data: SignupDto) {
    data.password = await hashPassword(data.password);
    const user = await this.usersService.create(data);
    return sanitizeUser(user);
  }
}
