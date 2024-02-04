import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaModule } from '../../prisma/prisma.module';
import { Bid, BidStatus } from '@prisma/client';
import { BidsController } from './bids.controller';
import { BidsService } from '../services/bids.service';
import { AuctionsModule } from '../auctions.module';

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

  const bidsServiceMock = {
    create: jest.fn().mockResolvedValue(bidData),
  } as jest.Mocked<Pick<BidsService, 'create'>>;

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [AuctionsModule, PrismaModule],
      providers: [BidsService],
    })
      .overrideProvider(BidsService)
      .useValue(bidsServiceMock);

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
  it('should fail to bid on an auction', async () => {
    try {
      await controller.bid('123', '123', { amount: 0 });
    } catch (e) {
      expect(e.message).toEqual('Invalid bid amount');
    }
  });
});
