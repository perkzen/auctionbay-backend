import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { AuthWsMiddleware } from '../../auth/middlewares/auth-ws.middleware';
import settings from '../../../app.settings';
import { OnEvent } from '@nestjs/event-emitter';
import { NewBidEventPayload } from '../events/new-bid.event';
import { BidsGatewayEmitEvents } from '../types/bids-server.types';
import { AuctionEvent } from '../../auctions/events/auctionEvent';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  path: '/live-bids',
  transport: ['websocket'],
  cors: {
    origin: settings.app.corsOrigin,
  },
})
@UseGuards(WsJwtGuard)
export class BidsGateway implements OnGatewayInit {
  private readonly logger: Logger = new Logger(BidsGateway.name);

  @WebSocketServer()
  server: Server<unknown, BidsGatewayEmitEvents>;

  constructor(private readonly wsMiddleware: AuthWsMiddleware) {}

  afterInit() {
    this.server.use(this.wsMiddleware.run());
  }

  @OnEvent(AuctionEvent.NEW_BID)
  publishNewBid(payload: NewBidEventPayload) {
    this.server.to(payload.auctionId).emit(AuctionEvent.NEW_BID, payload);
    this.logger.log(`New bid published for auction ${payload.auctionId}`);
  }
}
