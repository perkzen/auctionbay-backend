import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: PrismaService) {}

  async findOne(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }
}
