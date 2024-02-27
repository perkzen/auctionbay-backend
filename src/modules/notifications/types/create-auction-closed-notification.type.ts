import { AuctionStatus, BidStatus } from '@prisma/client';
import { CreateNotification } from './notification.types';

export type Bid = {
  id: string;
  bidderId: string;
  amount: number;
  status: BidStatus;
  auction: { title: string; id: string };
};

export type AuctionClosedNotification = {
  auctionId: string;
  message: string;
  bidStatus: BidStatus;
  outcome: number | 'CLOSED';
};

export const createAuctionClosedNotification = (
  bid: Bid,
): CreateNotification<AuctionClosedNotification> => ({
  userId: bid.bidderId,
  data: {
    auctionId: bid.auction.id,
    bidStatus: bid.status,
    message: bid.auction.title,
    outcome: bid.status === BidStatus.WON ? bid.amount : AuctionStatus.CLOSED,
  },
});
