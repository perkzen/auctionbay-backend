import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationEvent } from '../events/notification.events';
import { AuthWsMiddleware } from '../../auth/middlewares/auth-ws.middleware';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from '../../auth/types/auth.types';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import settings from '../../../app.settings';
import { NotificationsGatewayEmitEvents } from '../types/notification-server.types';
import { Notification } from '@prisma/client';

@WebSocketGateway({
  path: '/live-notifications',
  transport: ['websocket'],
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
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connections.delete(client.userId);
  }

  async notifyUsers(notifications: Notification[]) {
    for (const notification of notifications) {
      const userId = notification.userId;
      const socket = this.connections.get(userId);

      if (!socket) continue;

      this.server
        .to(socket.id)
        .emit(NotificationEvent.NEW_NOTIFICATION, notification);

      this.logger.log(`Notification sent to user ${userId}`);
    }
  }
}
