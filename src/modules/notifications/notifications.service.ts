import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './gateway/notifications.gateway';
import {
  createAuctionClosedNotification,
  Bid,
} from './types/create-auction-closed-notification.type';
import { CreateNotification } from './types/notification.types';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findByUserId(userId: string) {
    return this.db.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByAuctionId(auctionId: string) {
    return this.db.notification.findMany({
      where: {
        data: {
          path: ['auctionId'],
          equals: auctionId,
        },
      },
    });
  }

  async clearAll(userId: string) {
    return this.db.notification.deleteMany({
      where: {
        userId,
      },
    });
  }

  async createMany<T>(notifications: CreateNotification<T>[]) {
    return this.db.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        data: JSON.stringify(n.data),
      })),
    });
  }

  async sendAuctionClosedNotification(auctionId: string, data: Bid[]) {
    const notifications = data.map((bid) =>
      createAuctionClosedNotification(bid),
    );

    const { count } = await this.createMany(notifications);
    this.logger.log(`Created ${count} notifications for auction ${auctionId}`);

    const newNotifications = await this.findByAuctionId(auctionId);

    if (newNotifications.length > 0) {
      await this.notificationsGateway.notifyUsers(newNotifications);
      this.logger.log(
        `Notifying ${notifications.length} users about auction ${auctionId}`,
      );
    }
  }
}
