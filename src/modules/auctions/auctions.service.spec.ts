import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuctionsService } from './auctions.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { Auction } from '@prisma/client';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from '../users/users.service';

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
    duration: 1,
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
        firstname: 'Test',
        lastname: 'User',
        email: '',
        password: '',
      })
    ).id;

    auction = await auctionsService.create(auctionDTO, userId);
  });

  afterAll(async () => {
    await db.bid.deleteMany();
    await db.auction.deleteMany();
    await db.user.deleteMany();

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
    expect(newAuction.duration).toEqual(auctionDTO.duration);
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
});
