import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { BidsService } from './bids.service';
import { AuctionsService } from '../../auctions/services/auctions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import { Auction, BidStatus } from '@prisma/client';
import { CreateAuctionDTO } from '../../auctions/dtos/create-auction.dto';
import { faker } from '@faker-js/faker';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../../users/users.module';
import { UploadModule } from '../../upload/upload.module';
import { UploadService } from '../../upload/upload.service';
import { AuctionsModule } from '../../auctions/auctions.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BidsModule } from '../bids.module';

describe('BidsService', () => {
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

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [
        PrismaModule,
        UsersModule,
        UploadModule,
        AuctionsModule,
        BidsModule,
        EventEmitterModule.forRoot(),
      ],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock);

    app = await moduleRef.compile();
    auctionsService = app.get<AuctionsService>(AuctionsService);
    db = app.get<PrismaService>(PrismaService);
    userService = app.get<UsersService>(UsersService);
    bidsService = app.get<BidsService>(BidsService);

    userId = await createNewUser();

    bidderId = await createNewUser();
  });

  beforeEach(async () => {
    auction = await auctionsService.create(auctionDTO, userId, null);
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
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
  });

  it('should bid on an auction', async () => {
    const bid = await bidsService.create(auction.id, bidderId, 200);
    expect(bid).toBeDefined();
    expect(bid.amount).toEqual(200);
  });

  it('should fail to bid on an auction with invalid data', async () => {
    try {
      await bidsService.create('invalidAuctionId', bidderId, 200);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should throw error if user bids twice in a row', async () => {
    try {
      await bidsService.create(auction.id, bidderId, 300);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual('You are already the highest bidder');
    }
  });
  it('should throw error if bid amount is less than the current bid', async () => {
    try {
      await bidsService.create(auction.id, bidderId, 100);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toEqual('Bid amount must be greater than the last bid');
    }
  });

  it('should update bid statuses when new bid is placed', async () => {
    const newUserId = await createNewUser();

    await bidsService.create(auction.id, newUserId, 300);
    await bidsService.create(auction.id, bidderId, 400);

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
    expect(winningBid.amount).toEqual(400);
    expect(outbidBids).toBeDefined();
    expect(outbidBids.length).toBeGreaterThan(0);
  });
  it('should return empty array if auction is not closed', async () => {
    const newAuction = await auctionsService.create(auctionDTO, userId, null);
    await bidsService.create(newAuction.id, bidderId, 200);

    const lastBid = await bidsService.findLastBidsByEachUser(newAuction.id);

    expect(lastBid).toEqual([]);
  });
  it('should find last bids by each user on an auction', async () => {
    const newBidderId = await createNewUser();

    const newAuction = await auctionsService.create(auctionDTO, userId, null);
    await bidsService.create(newAuction.id, bidderId, 200);
    await bidsService.create(newAuction.id, newBidderId, 300);
    await bidsService.create(newAuction.id, bidderId, 400);

    await auctionsService.updateAuctionStatuses();

    const lastBids = await bidsService.findLastBidsByEachUser(newAuction.id);
    expect(lastBids).toBeDefined();
    expect(lastBids.length).toBe(2);
  });
});
