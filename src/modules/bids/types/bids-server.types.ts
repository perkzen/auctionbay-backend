import { NewBidEventPayload } from '../events/new-bid.event';
import { AuctionEvent } from '../../auctions/events/auctionEvent';

export interface BidsGatewayEmitEvents {
  [AuctionEvent.NEW_BID]: (data: NewBidEventPayload) => void;
}
