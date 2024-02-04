import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { AuctionsService } from '../auctions/auctions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { Auction, BidStatus } from '@prisma/client';
import { CreateAuctionDTO } from '../auctions/dtos/create-auction.dto';
import { faker } from '@faker-js/faker';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { UploadModule } from '../upload/upload.module';
import { UploadService } from '../upload/upload.service';
import { AuctionsModule } from '../auctions/auctions.module';

describe('BidsService', () => {
  let moduleRef: TestingModuleBuilder,
    auctionsService: AuctionsService,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService,
    bidsService: BidsService,
    userId: string,
    auction: Auction;

  const auctionDTO: CreateAuctionDTO = {
    title: 'Test Auction',
    description: 'Test Description',
    endsAt: new Date(),
    startingPrice: 100,
  };

  const uploadServiceMock = {
    upload: jest.fn().mockResolvedValue(faker.image.url()),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [PrismaModule, UsersModule, UploadModule, AuctionsModule],
      providers: [BidsService],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock);

    app = await moduleRef.compile();
    auctionsService = app.get<AuctionsService>(AuctionsService);
    db = app.get<PrismaService>(PrismaService);
    userService = app.get<UsersService>(UsersService);
    bidsService = app.get<BidsService>(BidsService);

    userId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    auction = await auctionsService.create(auctionDTO, userId, null);
  });

  afterAll(async () => {
    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(auctionsService).toBeDefined();
    expect(db).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
  });

  it('should bid on an auction', async () => {
    const bid = await bidsService.create(auction.id, userId, 200);
    expect(bid).toBeDefined();
    expect(bid.amount).toEqual(200);
  });

  it('should fail to bid on an auction with invalid data', async () => {
    try {
      await bidsService.create('invalidAuctionId', userId, 200);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should throw error if user bids twice in a row', async () => {
    try {
      await bidsService.create(auction.id, userId, 300);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual('You are already the highest bidder');
    }
  });
  it('should throw error if bid amount is less than the current bid', async () => {
    try {
      await bidsService.create(auction.id, userId, 100);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual('Bid amount must be greater than the last bid');
    }
  });

  it('should update bid statuses when new bid is placed', async () => {
    const newUserId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    await bidsService.create(auction.id, newUserId, 300);

    const updatedAuction = await db.auction.findUnique({
      where: {
        id: auction.id,
      },
      include: {
        bids: true,
      },
    });

    expect(updatedAuction).toBeDefined();

    const winningBid = updatedAuction.bids.find(
      (bid) => bid.status === BidStatus.WINNING,
    );
    const outbidBids = updatedAuction.bids.filter(
      (bid) => bid.status === BidStatus.OUTBID,
    );

    expect(winningBid).toBeDefined();
    expect(winningBid.amount).toEqual(300);
    expect(outbidBids).toBeDefined();
    expect(outbidBids.length).toBeGreaterThan(0);
  });
  it('should find winners of auctions', async () => {
    const newAuctionDTO: CreateAuctionDTO = {
      title: 'Test Auction 2',
      description: 'Test Description 2',
      endsAt: new Date(),
      startingPrice: 10,
    };

    const newUserId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    const newAuction = await auctionsService.create(
      newAuctionDTO,
      newUserId,
      null,
    );

    expect(newAuction).toBeDefined();
    expect(newAuction.id).toBeDefined();

    await bidsService.create(newAuction.id, userId, 200);
    await auctionsService.updateAuctionStatuses();

    const wonBids = (
      await db.bid.findMany({
        where: {
          auctionId: newAuction.id,
          status: BidStatus.WON,
        },
      })
    ).map((bid) => bid.id);

    const winners = await bidsService.findWonBids(wonBids);
    expect(winners).toBeDefined();
    expect(winners.length).toBeGreaterThan(0);
  });
});
