import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
import settings from '../../app.settings';
import { WsEvent } from '../../common/constants/ws-events';
import { AuthWsMiddleware } from '../auth/middlewares/auth-ws.middleware';
import { Logger } from '@nestjs/common';
import { AuthenticatedSocket } from '../auth/auth.types';

@WebSocketGateway({
  transport: ['websocket'],
  cors: {
    origin: settings.app.corsOrigin,
  },
})
export class AuctionGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly connections = new Map<string, Socket>();

  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly wsMiddleware: AuthWsMiddleware,
  ) {}

  afterInit() {
    this.server.use(this.wsMiddleware.run());
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.connections.set(client.userId, client);
    Logger.log(`User connected: ${client.userId}`, 'AuctionGateway');
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connections.delete(client.userId);
    Logger.log(`User disconnected: ${client.userId}`, 'AuctionGateway');
  }

  async notifyWinner(wonBidsIds: string[]) {
    const wonBids = await this.auctionsService.findWonBids(wonBidsIds);

    for (const winner of wonBids) {
      const winnerId = winner.bidder.id;
      const socket = this.connections.get(winnerId);

      if (!socket) continue;

      this.server.to(socket.id).emit(WsEvent.AUCTION_WON, winner);
    }
  }
}
