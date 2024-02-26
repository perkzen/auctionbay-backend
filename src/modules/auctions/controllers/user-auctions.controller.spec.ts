import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { UserAuctionsController } from './user-auctions.controller';
import { AuctionsService } from '../services/auctions.service';
import { Auction } from '@prisma/client';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuctionsModule } from '../auctions.module';

describe('UserAuctionsController', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    controller: UserAuctionsController;

  const auction: Auction = {
    title: 'Test Auction',
    description: 'Test Description',
    startingPrice: 100,
    imageUrl: 'https://test.com/image.jpg',
    endsAt: new Date(),
    status: 'ACTIVE',
    ownerId: '123',
    id: '123',
    createdAt: new Date(),
    closedPrice: null,
  };

  const userAuctionsServiceMock = {
    findByUserId: jest.fn().mockResolvedValue([auction]),
    findBiddingAuctionsByUserId: jest.fn().mockResolvedValue([auction]),
    findWonAuctionsByUserId: jest.fn().mockResolvedValue([auction]),
  } as jest.Mocked<
    Pick<
      AuctionsService,
      'findByUserId' | 'findBiddingAuctionsByUserId' | 'findWonAuctionsByUserId'
    >
  >;

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [AuctionsModule, PrismaModule],
    })
      .overrideProvider(AuctionsService)
      .useValue(userAuctionsServiceMock);

    app = await moduleRef.compile();
    controller = app.get<UserAuctionsController>(UserAuctionsController);
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

  it('should get user auctions', async () => {
    const auctions = await controller.getUserAuctions('123');
    expect(auctions).toEqual([auction]);
  });
  it('should get user bidding auctions', async () => {
    const auctions = await controller.getUserBiddingAuctions('123');
    expect(auctions).toEqual([auction]);
  });
  it('should get user won auctions', async () => {
    const auctions = await controller.getUserWonAuctions('123');
    expect(auctions).toEqual([auction]);
  });
  it('should fail to get user auctions', async () => {
    userAuctionsServiceMock.findByUserId.mockResolvedValueOnce([]);

    const res = await controller.getUserAuctions('123');
    expect(userAuctionsServiceMock.findByUserId).toHaveBeenCalledWith('123');
    expect(res).toEqual([]);
  });
  it('should fail to get user bidding auctions', async () => {
    userAuctionsServiceMock.findBiddingAuctionsByUserId.mockResolvedValueOnce(
      [],
    );

    const res = await controller.getUserBiddingAuctions('123');
    expect(
      userAuctionsServiceMock.findBiddingAuctionsByUserId,
    ).toHaveBeenCalledWith('123');
    expect(res).toEqual([]);
  });
  it('should fail to get user won auctions', async () => {
    userAuctionsServiceMock.findWonAuctionsByUserId.mockResolvedValueOnce([]);

    const res = await controller.getUserWonAuctions('123');
    expect(
      userAuctionsServiceMock.findWonAuctionsByUserId,
    ).toHaveBeenCalledWith('123');
    expect(res).toEqual([]);
  });
});
