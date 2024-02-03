import { NotificationEvent } from '../events/notification.events';
import { WonBid } from '../../auctions/types/won-bid.type';

export interface EmitEvents {
  [NotificationEvent.AUCTION_WON]: (data: WonBid) => void;
}
