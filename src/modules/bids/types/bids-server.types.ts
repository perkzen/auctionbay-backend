import { NewBidEventPayload } from '../dtos/new-bid-event-payload';
import { AuctionEvent } from '../../auctions/events/auctionEvent';

export interface BidsGatewayEmitEvents {
  [AuctionEvent.NEW_BID]: (data: NewBidEventPayload) => void;
}

export interface BidsGatewayListenEvents {
  'join-room': (auctionId: string) => void;
  'leave-room': (auctionId: string) => void;
}
