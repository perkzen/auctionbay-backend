import {
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthWsMiddleware } from '@app/modules/auth/middlewares/auth-ws.middleware';
import settings from '@app//app.settings';
import { OnEvent } from '@nestjs/event-emitter';
import { NewBidEventPayload } from '../events/new-bid.event';
import {
  BidsGatewayEmitEvents,
  BidsGatewayListenEvents,
} from '../types/bids-server.types';
import { AuctionEvent } from '@app/modules/auctions/events/auctionEvent';
import { WsJwtGuard } from '@app/modules/auth/guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: '/live-bids',
  cors: {
    origin: settings.app.corsOrigin,
  },
})
@UseGuards(WsJwtGuard)
export class BidsGateway implements OnGatewayInit, OnGatewayConnection {
  private readonly logger: Logger = new Logger(BidsGateway.name);

  @WebSocketServer()
  server: Server<BidsGatewayListenEvents, BidsGatewayEmitEvents>;

  constructor(private readonly wsMiddleware: AuthWsMiddleware) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  afterInit() {
    this.server.use(this.wsMiddleware.run());
  }

  @SubscribeMessage('join-room')
  async handleJoin(client: Socket, auctionId: string) {
    this.logger.log(`Client ${client.id} joining auction ${auctionId}`);
    client.join(auctionId);
  }

  @SubscribeMessage('leave-room')
  async handleLeave(client: Socket, auctionId: string) {
    this.logger.log(`Client ${client.id} leaving auction ${auctionId}`);
    client.leave(auctionId);
  }

  @OnEvent(AuctionEvent.NEW_BID)
  publishNewBid(payload: NewBidEventPayload) {
    this.server.to(payload.auctionId).emit(AuctionEvent.NEW_BID, payload);
    this.logger.log(`New bid published for auction ${payload.auctionId}`);
  }
}
