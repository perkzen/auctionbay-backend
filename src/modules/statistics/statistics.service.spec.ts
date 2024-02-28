import { StatisticsService } from './statistics.service';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StatisticsModule } from './statistics.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { faker } from '@faker-js/faker';
import { AuctionStatus, BidStatus } from '@prisma/client';
import { AuctionsModule } from '../auctions/auctions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('StatisticsService', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    db: PrismaService,
    userId1: string,
    userId2: string,
    statisticsService: StatisticsService;

  const createClosedAuction = async (ownerId: string, closedPrice: number) => {
    await db.auction.create({
      data: {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        imageUrl: '',
        startingPrice: 100,
        endsAt: new Date(),
        status: AuctionStatus.CLOSED,
        ownerId,
        closedPrice,
      },
    });
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [
        PrismaModule,
        UsersModule,
        StatisticsModule,
        AuctionsModule,
        EventEmitterModule.forRoot(),
      ],
    });

    app = await moduleRef.compile();
    db = app.get<PrismaService>(PrismaService);
    statisticsService = app.get<StatisticsService>(StatisticsService);
  });

  beforeEach(async () => {
    userId1 = (
      await db.user.create({
        data: {
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          email: faker.internet.email(),
          password: '',
        },
      })
    ).id;

    userId2 = (
      await db.user.create({
        data: {
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          email: faker.internet.email(),
          password: '',
        },
      })
    ).id;
  });

  afterEach(async () => {
    await db.clearDatabase();
  });

  afterAll(async () => {
    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(statisticsService).toBeDefined();
    expect(db).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
  });

  it('should return 0 for users earnings', async () => {
    await createClosedAuction(userId1, 0);
    const earnings = await statisticsService.earningsByUser(userId1);
    expect(earnings).toEqual(0);
  });
  it('should return 300 for users earnings', async () => {
    await createClosedAuction(userId1, 150);
    await createClosedAuction(userId1, 150);
    const earnings = await statisticsService.earningsByUser(userId1);
    expect(earnings).toEqual(300);
  });
  it('should return 0 as the number of posted auctions by user', async () => {
    const postedAuctions =
      await statisticsService.postedAuctionsByUser(userId1);
    expect(postedAuctions).toEqual(0);
  });
  it('should return 2 as the number of posted auctions by user', async () => {
    await createClosedAuction(userId1, 150);
    await createClosedAuction(userId1, 150);
    const postedAuctions =
      await statisticsService.postedAuctionsByUser(userId1);
    expect(postedAuctions).toEqual(2);
  });
  it('should return 0 as the number of active bids by user', async () => {
    const wonAuctions = await statisticsService.activeBidsByUser(userId1);
    expect(wonAuctions).toEqual(0);
  });
  it('should return 2 as the number of active bids by user', async () => {
    const action1 = await db.auction.create({
      data: {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        imageUrl: '',
        startingPrice: 100,
        endsAt: new Date(),
        status: AuctionStatus.ACTIVE,
        ownerId: userId2,
      },
    });

    await db.bid.create({
      data: {
        amount: 150,
        auctionId: action1.id,
        bidderId: userId1,
        status: BidStatus.WINNING,
      },
    });

    const action2 = await db.auction.create({
      data: {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        imageUrl: '',
        startingPrice: 100,
        endsAt: new Date(),
        status: AuctionStatus.ACTIVE,
        ownerId: userId2,
      },
    });

    await db.bid.create({
      data: {
        amount: 150,
        auctionId: action2.id,
        bidderId: userId1,
        status: BidStatus.WINNING,
      },
    });

    const activeBids = await statisticsService.activeBidsByUser(userId1);
    expect(activeBids).toEqual(2);
  });

  it('should return 0 as the number of currently winning bids by user', async () => {
    const winningBids =
      await statisticsService.currentlyWinningBidsByUser(userId1);
    expect(winningBids).toEqual(0);
  });

  it('should return 2 as the number of currently winning bids by user', async () => {
    const action1 = await db.auction.create({
      data: {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        imageUrl: '',
        startingPrice: 100,
        endsAt: new Date(),
        status: AuctionStatus.ACTIVE,
        ownerId: userId2,
      },
    });

    await db.bid.create({
      data: {
        amount: 150,
        auctionId: action1.id,
        bidderId: userId1,
        status: BidStatus.WINNING,
      },
    });

    const action2 = await db.auction.create({
      data: {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        imageUrl: '',
        startingPrice: 100,
        endsAt: new Date(),
        status: AuctionStatus.ACTIVE,
        ownerId: userId2,
      },
    });

    await db.bid.create({
      data: {
        amount: 150,
        auctionId: action2.id,
        bidderId: userId1,
        status: BidStatus.WINNING,
      },
    });

    const wonBids = await statisticsService.currentlyWinningBidsByUser(userId1);
    expect(wonBids).toEqual(2);
  });
});
