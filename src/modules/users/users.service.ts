import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDTO } from '../auth/dtos/signup.dto';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { comparePasswords, hashPassword } from '../auth/auth.utils';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async create(user: SignupDTO) {
    return this.db.user.create({
      data: {
        ...user,
        password: await hashPassword(user.password),
      },
    });
  }

  async updatePassword(data: UpdatePasswordDTO, email: string) {
    const user = await this.findByEmail(email);

    const isCorrectPassword = await comparePasswords(
      data.oldPassword,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new HttpException(
        "Password doesn't match",
        HttpStatus.UNAUTHORIZED,
      );
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await this.db.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }
}
