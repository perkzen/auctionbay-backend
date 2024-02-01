import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDTO } from '../auth/dtos/signup.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async findOne(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async create(data: SignupDTO) {
    return this.db.user.create({
      data,
    });
  }
}
