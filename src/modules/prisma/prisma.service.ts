import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { isTestEnv } from '@app/common/utils/env-check';

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
    if (!isTestEnv()) return;
    await this.autoBid.deleteMany();
    await this.notification.deleteMany();
    await this.bid.deleteMany();
    await this.auction.deleteMany();
    await this.user.deleteMany();
  }
}
