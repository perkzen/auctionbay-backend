import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from '../auctions/auctions.service';
import { NotificationEvent } from './events/notification.events';
import { AuthWsMiddleware } from '../auth/middlewares/auth-ws.middleware';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthenticatedSocket } from '../auth/auth.types';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import settings from '../../app.settings';

@WebSocketGateway({
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
  server: Server;

  private readonly connections = new Map<string, Socket>();

  private readonly logger: Logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly wsMiddleware: AuthWsMiddleware,
  ) {}

  afterInit() {
    this.server.use(this.wsMiddleware.run());
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.connections.set(client.userId, client);
    this.logger.log(`User connected: ${client.userId}`, 'NotificationsGateway');
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connections.delete(client.userId);
    this.logger.log(
      `User disconnected: ${client.userId}`,
      'NotificationsGateway',
    );
  }

  async notifyWinner(wonBidsIds: string[]) {
    const wonBids = await this.auctionsService.findWonBids(wonBidsIds);

    for (const winner of wonBids) {
      const winnerId = winner.bidder.id;
      const socket = this.connections.get(winnerId);

      if (!socket) continue;

      this.server.to(socket.id).emit(NotificationEvent.AUCTION_WON, winner);
      this.logger.log(
        `Notified user ${winnerId} about winning auction`,
        'NotificationsGateway',
      );
    }
  }
}
