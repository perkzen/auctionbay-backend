import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuctionsService } from '../../auctions/services/auctions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { BidsService } from './bids.service';
import { Auction } from '@prisma/client';
import { CreateAuctionDTO } from '../../auctions/dtos/create-auction.dto';
import { faker } from '@faker-js/faker';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../../users/users.module';
import { UploadModule } from '../../upload/upload.module';
import { AuctionsModule } from '../../auctions/auctions.module';
import { UploadService } from '../../upload/upload.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AutoBidService } from './auto-bid.service';

describe('AutoBidService', () => {
  let moduleRef: TestingModuleBuilder,
    auctionsService: AuctionsService,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService,
    bidsService: BidsService,
    auctionOwnerId: string,
    auction: Auction,
    autoBidService: AutoBidService,
    bidderId: string;

  const auctionDTO: CreateAuctionDTO = {
    title: 'Test Auction',
    description: 'Test Description',
    endsAt: new Date(),
    startingPrice: 100,
  };

  const createNewUser = async () => {
    return (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;
  };

  const uploadServiceMock = {
    upload: jest.fn().mockResolvedValue(faker.image.url()),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [
        PrismaModule,
        UsersModule,
        UploadModule,
        AuctionsModule,
        EventEmitterModule.forRoot(),
      ],
      providers: [BidsService],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock);

    app = await moduleRef.compile();
    db = app.get<PrismaService>(PrismaService);
    auctionsService = app.get<AuctionsService>(AuctionsService);
    userService = app.get<UsersService>(UsersService);
    bidsService = app.get<BidsService>(BidsService);
    autoBidService = app.get<AutoBidService>(AutoBidService);

    auctionOwnerId = await createNewUser();
    bidderId = await createNewUser();
  });

  beforeEach(async () => {
    auction = await auctionsService.create(auctionDTO, auctionOwnerId, null);
  });

  afterEach(async () => {
    await db.auction.deleteMany();
  });

  afterAll(async () => {
    await db.clearDatabase();

    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(auctionsService).toBeDefined();
    expect(db).toBeDefined();
    expect(userService).toBeDefined();
    expect(bidsService).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
    expect(auctionOwnerId).toBeDefined();
    expect(auction).toBeDefined();
    expect(autoBidService).toBeDefined();
  });

  it('should create an auto bid', async () => {
    const autoBid = await autoBidService.create(auction.id, auctionOwnerId, {
      incrementAmount: 100,
      maxAmount: 200,
    });

    expect(autoBid).toBeDefined();
    expect(autoBid.incrementAmount).toEqual(100);
    expect(autoBid.maxAmount).toEqual(200);
    expect(autoBid.auctionId).toEqual(auction.id);
    expect(autoBid.bidderId).toEqual(auctionOwnerId);
  });

  it('should fail to create an auto bid with invalid auction id', async () => {
    try {
      await autoBidService.create('invalidAuctionId', auctionOwnerId, {
        incrementAmount: 100,
        maxAmount: 200,
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should fail to create an auto bid with invalid user id', async () => {
    try {
      await autoBidService.create(auction.id, 'invalidUserId', {
        incrementAmount: 100,
        maxAmount: 200,
      });
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should fail to create an auto bid with invalid data', async () => {
    try {
      await autoBidService.create(auction.id, auctionOwnerId, {
        incrementAmount: 100,
        maxAmount: 50,
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toEqual(
        'Max amount should be greater than increment amount.',
      );
    }
  });
  it('should return empty array of valid auto bids', async () => {
    const autoBids = await autoBidService.findValidAutoBids(
      auction.id,
      auctionOwnerId,
      100,
    );

    expect(autoBids).toBeDefined();
    expect(autoBids.length).toEqual(0);
    expect(autoBids).toEqual([]);
  });
  it('should return valid auto bids', async () => {
    await autoBidService.create(auction.id, bidderId, {
      incrementAmount: 100,
      maxAmount: 200,
    });

    const autoBids = await autoBidService.findValidAutoBids(
      auction.id,
      auctionOwnerId,
      100,
    );

    expect(autoBids).toBeDefined();
    expect(autoBids.length).toEqual(1);
    expect(autoBids[0].incrementAmount).toEqual(100);
    expect(autoBids[0].maxAmount).toEqual(200);
    expect(autoBids[0].auctionId).toEqual(auction.id);
    expect(autoBids[0].bidderId).toEqual(bidderId);
  });
  it("should return empty array if there aren't any valid auto bids", async () => {
    const newUserId = await createNewUser();

    await autoBidService.create(auction.id, newUserId, {
      incrementAmount: 100,
      maxAmount: 200,
    });

    const autoBids = await autoBidService.findValidAutoBids(
      auction.id,
      auctionOwnerId,
      300,
    );

    expect(autoBids).toBeDefined();
    expect(autoBids.length).toEqual(0);
    expect(autoBids).toEqual([]);
  });
  it('should auto bid', async () => {
    const newUserId = await createNewUser();
    const incrementAmount = 100;
    const bid = await autoBidService.autoBid(
      auction.id,
      newUserId,
      incrementAmount,
      200,
    );

    expect(bid).toBeDefined();
    expect(bid.amount).toEqual(auction.startingPrice);
    expect(bid.auctionId).toEqual(auction.id);
    expect(bid.bidderId).toEqual(newUserId);
  });
  it('should fail to auto bid with invalid auction id', async () => {
    const bid = await autoBidService.autoBid(
      'invalidAuctionId',
      auctionOwnerId,
      100,
      200,
    );
    expect(bid).toBeNull();
  });
  it('should fail to auto bid if last bidder is the same', async () => {
    const newUserId = await createNewUser();
    await bidsService.create(auction.id, newUserId, 200);
    const bid = await autoBidService.autoBid(auction.id, newUserId, 100, 200);

    expect(bid).toBeNull();
  });
  it("should handle new bid event and auto bid if it's valid", async () => {
    const newUserId = await createNewUser();
    await autoBidService.create(auction.id, newUserId, {
      incrementAmount: 100,
      maxAmount: 500,
    });

    await bidsService.create(auction.id, bidderId, 200);
    await autoBidService.handleNewBidEvent({
      auctionId: auction.id,
      amount: 200,
      bidderId: bidderId,
    });

    const lastBid = await bidsService.findLastBid(auction.id);
    expect(lastBid.amount).toEqual(300);
    expect(lastBid.bidderId).toEqual(newUserId);
  });
  it("should handle new bid event and not auto bid if it's invalid", async () => {
    const newUserId = await createNewUser();
    await autoBidService.create(auction.id, newUserId, {
      incrementAmount: 100,
      maxAmount: 500,
    });

    await bidsService.create(auction.id, bidderId, 500);
    await autoBidService.handleNewBidEvent({
      auctionId: auction.id,
      amount: 500,
      bidderId: bidderId,
    });

    const lastBid = await bidsService.findLastBid(auction.id);
    expect(lastBid.amount).toEqual(500);
    expect(lastBid.bidderId).toEqual(bidderId);
  });
});
