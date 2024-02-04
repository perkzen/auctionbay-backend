import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuctionsController } from './auctions.controller';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { AuctionsModule } from './auctions.module';
import { AuctionsService } from './auctions.service';
import { PrismaModule } from '../prisma/prisma.module';
import { Auction } from '@prisma/client';

describe('AuctionsController', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    controller: AuctionsController;

  const auctionData: Auction = {
    title: 'Test Auction',
    description: 'Test Description',
    startingPrice: 100,
    imageUrl: 'https://test.com/image.jpg',
    endsAt: new Date(),
    status: 'ACTIVE',
    ownerId: '123',
    id: '123',
    createdAt: new Date(),
  };

  const auctionsServiceMock = {
    create: jest.fn().mockResolvedValue(auctionData),
    update: jest.fn().mockResolvedValue(auctionData),
    list: jest.fn().mockResolvedValue([auctionData]),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [AuctionsModule, PrismaModule],
    })
      .overrideProvider(AuctionsService)
      .useValue(auctionsServiceMock);

    app = await moduleRef.compile();
    controller = app.get<AuctionsController>(AuctionsController);
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

  it('should create an auction', async () => {
    const data: CreateAuctionDTO = {
      title: 'Test Auction',
      description: 'Test Description',
      startingPrice: 100,
      endsAt: new Date(),
    };
    const auction = await controller.create(data, '123', null);

    expect(auction).toEqual(auctionData);
    expect(auctionsServiceMock.create).toHaveBeenCalledWith(data, '123', null);
  });

  it('should update an auction', async () => {
    const data: CreateAuctionDTO = {
      title: 'Test Auction',
      description: 'Test Description',
      startingPrice: 100,
      endsAt: new Date(),
    };
    const auction = await controller.update(data, '123');

    expect(auction).toEqual(auctionData);
    expect(auctionsServiceMock.update).toHaveBeenCalledWith(data, '123');
  });

  it('should fail to update an auction', async () => {
    const data: CreateAuctionDTO = {
      title: 'Test Auction',
      description: 'Test Description',
      startingPrice: 100,
      endsAt: new Date(),
    };
    try {
      await controller.update(data, '1233');
    } catch (e) {
      expect(e.message).toEqual('Auction not found');
    }
    expect(auctionsServiceMock.update).toHaveBeenCalledWith(data, '1233');
  });

  it('should list all auctions', async () => {
    const auctions = await controller.list();

    expect(auctions).toEqual([auctionData]);
    expect(auctionsServiceMock.list).toHaveBeenCalled();
  });
});
