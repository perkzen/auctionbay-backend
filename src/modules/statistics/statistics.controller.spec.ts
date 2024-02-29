import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuctionsModule } from '../auctions/auctions.module';
import { UploadModule } from '../upload/upload.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StatisticsModule } from './statistics.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('StatisticsController', () => {
  let moduleRef: TestingModuleBuilder,
    controller: StatisticsController,
    app: TestingModule;

  const statisticsServiceMock = {
    earningsByUser: jest.fn().mockResolvedValue(100),
    activeBidsByUser: jest.fn().mockResolvedValue(10),
    currentlyWinningBidsByUser: jest.fn().mockResolvedValue(5),
    postedAuctionsByUser: jest.fn().mockResolvedValue(20),
  } as jest.Mocked<
    Pick<
      StatisticsService,
      | 'earningsByUser'
      | 'activeBidsByUser'
      | 'currentlyWinningBidsByUser'
      | 'postedAuctionsByUser'
    >
  >;

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [
        AuctionsModule,
        UploadModule,
        PrismaModule,
        StatisticsModule,
        EventEmitterModule.forRoot(),
      ],
    })
      .overrideProvider(StatisticsService)
      .useValue(statisticsServiceMock);

    app = await moduleRef.compile();
    controller = app.get<StatisticsController>(StatisticsController);
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

  it('should get earnings by user', async () => {
    const userId = 'user-id';
    const { earnings } = await controller.getEarningsByUser(userId);
    expect(earnings).toBe(100);
    expect(statisticsServiceMock.earningsByUser).toHaveBeenCalledWith(userId);
  });

  it('should get active bids by user', async () => {
    const userId = 'user-id';
    const { activeBids } = await controller.getActiveBidsByUser(userId);
    expect(activeBids).toBe(10);
    expect(statisticsServiceMock.activeBidsByUser).toHaveBeenCalledWith(userId);
  });

  it('should get currently winning bids by user', async () => {
    const userId = 'user-id';
    const { winningBids } =
      await controller.getCurrentlyWinningBidsByUser(userId);
    expect(window).toBe(5);
    expect(
      statisticsServiceMock.currentlyWinningBidsByUser,
    ).toHaveBeenCalledWith(userId);
  });

  it('should get posted auctions by user', async () => {
    const userId = 'user-id';
    const { postedAuctions } = await controller.getPostedAuctionsByUser(userId);
    expect(postedAuctions).toBe(20);
    expect(statisticsServiceMock.postedAuctionsByUser).toHaveBeenCalledWith(
      userId,
    );
  });

  it('should fail to get earnings by user', async () => {
    const userId = 'user-id';
    statisticsServiceMock.earningsByUser.mockRejectedValueOnce(
      new Error('error'),
    );
    await expect(controller.getEarningsByUser(userId)).rejects.toThrow('error');
  });

  it('should fail to get active bids by user', async () => {
    const userId = 'user-id';
    statisticsServiceMock.activeBidsByUser.mockRejectedValueOnce(
      new Error('error'),
    );
    await expect(controller.getActiveBidsByUser(userId)).rejects.toThrow(
      'error',
    );
  });

  it('should fail to get currently winning bids by user', async () => {
    const userId = 'user-id';
    statisticsServiceMock.currentlyWinningBidsByUser.mockRejectedValueOnce(
      new Error('error'),
    );
    await expect(
      controller.getCurrentlyWinningBidsByUser(userId),
    ).rejects.toThrow('error');
  });

  it('should fail to get posted auctions by user', async () => {
    const userId = 'user-id';
    statisticsServiceMock.postedAuctionsByUser.mockRejectedValueOnce(
      new Error('error'),
    );
    await expect(controller.getPostedAuctionsByUser(userId)).rejects.toThrow(
      'error',
    );
  });
});
