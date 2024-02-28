import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { Bid, BidStatus } from '@prisma/client';
import { BidsController } from './bids.controller';
import { BidsService } from './services/bids.service';
import { AuctionsModule } from '../auctions/auctions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AutoBidService } from './services/auto-bid.service';

describe('BidsController', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    controller: BidsController;

  const bidData: Bid = {
    amount: 100,
    auctionId: '123',
    bidderId: '123',
    createdAt: new Date(),
    status: BidStatus.WINNING,
    id: '123',
  };

  const autoBidData = {
    incrementAmount: 100,
    maxAmount: 200,
    bidderId: '123',
    auctionId: '123',
  };

  const bidsServiceMock = {
    create: jest.fn().mockResolvedValue(bidData),
  } as jest.Mocked<Pick<BidsService, 'create'>>;

  const autoBidServiceMock = {
    create: jest.fn().mockResolvedValue(autoBidData),
  } as jest.Mocked<Pick<BidsService, 'create'>>;

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [AuctionsModule, PrismaModule, EventEmitterModule.forRoot()],
      providers: [BidsService],
    })
      .overrideProvider(BidsService)
      .useValue(bidsServiceMock)
      .overrideProvider(AutoBidService)
      .useValue(autoBidServiceMock);

    app = await moduleRef.compile();
    controller = app.get<BidsController>(BidsController);
  });

  afterAll(async () => {
    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
  });
  it('should bid on an auction', async () => {
    const bid = await controller.bid('123', '123', { amount: 100 });
    expect(bid).toEqual(bidData);
  });
  it('should auto-bid on an auction', async () => {
    const autoBid = await controller.autoBid('123', '123', autoBidData);
    expect(autoBid).toEqual(autoBidData);
  });
});
