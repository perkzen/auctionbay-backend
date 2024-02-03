import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuctionsService } from './auctions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { Auction, BidStatus } from '@prisma/client';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from '../users/users.service';
import { faker } from '@faker-js/faker';

describe('AuctionsService', () => {
  let moduleRef: TestingModuleBuilder,
    auctionsService: AuctionsService,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService,
    userId: string,
    auction: Auction;

  const auctionDTO: CreateAuctionDTO = {
    title: 'Test Auction',
    description: 'Test Description',
    endsAt: new Date(),
    imageUrl: 'https://test.com/image.jpg',
    startingPrice: 100,
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [PrismaModule, UsersModule],
      providers: [AuctionsService],
    });

    app = await moduleRef.compile();
    auctionsService = app.get<AuctionsService>(AuctionsService);
    db = app.get<PrismaService>(PrismaService);
    userService = app.get<UsersService>(UsersService);

    userId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    auction = await auctionsService.create(auctionDTO, userId);
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

  it('should create an auction', async () => {
    const newAuction = await auctionsService.create(auctionDTO, userId);

    expect(newAuction).toBeDefined();
    expect(newAuction.title).toEqual(auctionDTO.title);
    expect(newAuction.description).toEqual(auctionDTO.description);
    expect(newAuction.endsAt).toEqual(auctionDTO.endsAt);
    expect(newAuction.imageUrl).toEqual(auctionDTO.imageUrl);
    expect(newAuction.startingPrice).toEqual(auctionDTO.startingPrice);
  });

  it('should fail to create an auction with invalid data', async () => {
    try {
      await auctionsService.create(auction, 'invalidUserId');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should update an auction', async () => {
    const updatedAuction = await auctionsService.update(
      { startingPrice: 200 },
      auction.id,
    );

    expect(updatedAuction).toBeDefined();
    expect(updatedAuction.startingPrice).toEqual(200);
  });

  it('should list auctions', async () => {
    const auctions = await auctionsService.list();

    expect(auctions).toBeDefined();
    expect(auctions.length).toBeGreaterThan(0);
  });

  it('should fail to update an auction with invalid data', async () => {
    try {
      await auctionsService.update(auction, 'invalidAuctionId');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it('should bid on an auction', async () => {
    await auctionsService.bid(auction.id, userId, 200);
  });

  it('should fail to bid on an auction with invalid data', async () => {
    try {
      await auctionsService.bid('invalidAuctionId', userId, 200);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should throw error if user bids twice in a row', async () => {
    try {
      await auctionsService.bid(auction.id, userId, 300);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual('You are already the highest bidder');
    }
  });
  it('should throw error if bid amount is less than the current bid', async () => {
    try {
      await auctionsService.bid(auction.id, userId, 100);
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

    await auctionsService.bid(auction.id, newUserId, 300);

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

  it("should update auction statuses when they're closed and set the last bit to won", async () => {
    const newAuction = await auctionsService.create(auctionDTO, userId);
    const newUserId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    await auctionsService.bid(newAuction.id, newUserId, 200);

    await auctionsService.updateAuctionStatuses();

    const updatedAuction = await db.auction.findUnique({
      where: {
        id: newAuction.id,
      },
      include: {
        bids: true,
      },
    });

    const bids = updatedAuction.bids;

    expect(updatedAuction).toBeDefined();
    expect(updatedAuction.status).toEqual('CLOSED');
    expect(bids).toBeDefined();
    expect(bids.length).toBeGreaterThan(0);
    expect(bids![0].status).toEqual(BidStatus.WON);
  });
  it('should find winners of auctions', async () => {
    const newAuctionDTO: CreateAuctionDTO = {
      title: 'Test Auction 2',
      description: 'Test Description 2',
      endsAt: new Date(),
      imageUrl: 'https://test.com/image.jpg',
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

    const newAuction = await auctionsService.create(newAuctionDTO, newUserId);

    expect(newAuction).toBeDefined();
    expect(newAuction.id).toBeDefined();

    await auctionsService.bid(newAuction.id, userId, 200);
    await auctionsService.updateAuctionStatuses();

    const wonBids = (
      await db.bid.findMany({
        where: {
          auctionId: newAuction.id,
          status: BidStatus.WON,
        },
      })
    ).map((bid) => bid.id);

    const winners = await auctionsService.findWonBids(wonBids);
    expect(winners).toBeDefined();
    expect(winners.length).toBeGreaterThan(0);
  });
});
