import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings, { Environment } from '../../app.settings';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async clearDatabase() {
    if (settings.app.environment !== Environment.TEST) return;
    await this.bid.deleteMany({});
    await this.auction.deleteMany({});
    await this.user.deleteMany({});
  }
}
