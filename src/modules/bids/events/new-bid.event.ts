export class NewBidEvent {
  constructor(
    public readonly auctionId: string,
    public readonly bidderId: string,
    public readonly amount: number,
  ) {}
}
