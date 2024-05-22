import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import settings from '@app/app.settings';
import { NotificationsGatewayEmitEvents } from '../types/notification-server.types';
import { Notification } from '@prisma/client';
import { WsJwtGuard } from '@app/modules/auth/guards/ws-jwt.guard';
import { AuthWsMiddleware } from '@app/modules/auth/middlewares/auth-ws.middleware';
import { AuthenticatedSocket } from '@app/modules/auth/types/auth.types';
import { NotificationEvent } from '@app/modules/notifications/events/notification.events';

@WebSocketGateway({
  namespace: '/live-notifications',
  cors: {
    origin: settings.app.corsOrigin,
  },
})
@UseGuards(WsJwtGuard)
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server<unknown, NotificationsGatewayEmitEvents>;

  private readonly connections = new Map<string, Socket>();

  private readonly logger: Logger = new Logger(NotificationsGateway.name);

  constructor(private readonly wsMiddleware: AuthWsMiddleware) {}

  afterInit() {
    this.server.use(this.wsMiddleware.run());
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.connections.set(client.userId, client);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connections.delete(client.userId);
  }

  async notifyUsers(notifications: Notification[]) {
    this.logger.log(`Received ${notifications.length} notifications to send`);

    for (const notification of notifications) {
      const userId = notification.userId;
      const socket = this.connections.get(userId);

      if (!socket) {
        this.logger.log(
          `User ${userId} is not connected, skipping notification`,
        );
        continue;
      }

      this.server
        .to(socket.id)
        .emit(NotificationEvent.NEW_NOTIFICATION, notification);

      this.logger.log(
        `Notification sent to user ${userId} with socket ${socket.id}`,
      );
    }
  }
}
