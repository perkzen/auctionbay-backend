export type WonBid = {
  auction: { id: string; title: string };
  id: string;
  amount: number;
  bidder: { id: string; email: string; firstname: string; lastname: string };
};
