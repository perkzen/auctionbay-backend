import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuctionsService } from './auctions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuctionDTO } from '../dtos/create-auction.dto';
import { Auction, BidStatus } from '@prisma/client';
import { UsersModule } from '../../users/users.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersService } from '../../users/users.service';
import { faker } from '@faker-js/faker';
import { UploadService } from '../../upload/upload.service';
import { UploadModule } from '../../upload/upload.module';
import { BidsService } from '../../bids/services/bids.service';
import { AuctionsModule } from '../auctions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('AuctionsService', () => {
  let moduleRef: TestingModuleBuilder,
    auctionsService: AuctionsService,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService,
    bidsService: BidsService,
    userId: string,
    auction: Auction,
    bidderId: string;

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
      imports: [
        PrismaModule,
        UsersModule,
        UploadModule,
        AuctionsModule,
        EventEmitterModule.forRoot(),
      ],
      providers: [AuctionsService, BidsService],
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

    bidderId = (
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
    await db.clearDatabase();

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
    const newAuction = await auctionsService.create(auctionDTO, userId, null);

    expect(newAuction).toBeDefined();
    expect(newAuction.title).toEqual(auctionDTO.title);
    expect(newAuction.description).toEqual(auctionDTO.description);
    expect(newAuction.endsAt).toEqual(auctionDTO.endsAt);
    expect(newAuction.startingPrice).toEqual(auctionDTO.startingPrice);
  });

  it('should fail to create an auction with invalid data', async () => {
    try {
      await auctionsService.create(auction, 'invalidUserId', null);
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
    const auctions = await auctionsService.list(userId);

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

  it("should update auction statuses when they're closed and set the last bit to won", async () => {
    const newAuction = await auctionsService.create(auctionDTO, userId, null);
    const newUserId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    await bidsService.create(newAuction.id, newUserId, 200);

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
  it('should find an auction by id', async () => {
    const foundAuction = await auctionsService.findById(auction.id);

    expect(foundAuction).toBeDefined();
    expect(foundAuction.id).toEqual(auction.id);
  });
  it('should fail to find an auction by id', async () => {
    try {
      await auctionsService.findById('invalidId');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it("should find auctions by the user's id", async () => {
    const auctions = await auctionsService.findByUserId(userId);

    expect(auctions).toBeDefined();
    expect(auctions.length).toBeGreaterThan(0);
  });
  it('should fail to find auctions by the user id', async () => {
    try {
      await auctionsService.findByUserId('invalidUserId');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it("should return an empty array when the user hasn't won any auctions", async () => {
    const auctions = await auctionsService.findWonAuctionsByUserId(userId);

    expect(auctions).toBeDefined();
    expect(auctions).toEqual([]);
    expect(auctions.length).toEqual(0);
  });
  it('should find auctions where users has won', async () => {
    const newUserId = (
      await userService.create({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })
    ).id;

    const newAuction = await auctionsService.create(
      auctionDTO,
      newUserId,
      null,
    );

    await bidsService.create(newAuction.id, userId, 200);
    await auctionsService.updateAuctionStatuses();

    const auctions = await auctionsService.findWonAuctionsByUserId(userId);
    expect(auctions).toBeDefined();
    expect(auctions.length).toBeGreaterThan(0);
  });
  it('should return an empty array when the user has not bid on any auctions', async () => {
    const auctions = await auctionsService.findBiddingAuctionsByUserId(userId);

    expect(auctions).toBeDefined();
    expect(auctions).toEqual([]);
    expect(auctions.length).toEqual(0);
  });
  it('should find auctions where the user has bid', async () => {
    const newAuction = await auctionsService.create(auctionDTO, userId, null);

    await bidsService.create(newAuction.id, bidderId, 200);

    const auctions =
      await auctionsService.findBiddingAuctionsByUserId(bidderId);

    expect(auctions).toBeDefined();
    expect(auctions.length).toBeGreaterThan(0);
  });
});
