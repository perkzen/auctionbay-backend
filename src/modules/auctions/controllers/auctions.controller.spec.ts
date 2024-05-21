import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuctionsController } from './auctions.controller';
import { CreateAuctionDTO } from '../dtos/create-auction.dto';
import { AuctionsModule } from '../auctions.module';
import { AuctionsService } from '../services/auctions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { Auction } from '@prisma/client';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UpdateAuctionDTO } from '../dtos/update-auction.dto';
import { AuctionListDTO } from '@app/modules/auctions/dtos/auction-list.dto';

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
    closedPrice: null,
  };

  const auctionList: AuctionListDTO[] = [
    {
      ...auctionData,
      bids: [],
    },
  ];

  const auctionsServiceMock = {
    create: jest.fn().mockResolvedValue(auctionData),
    update: jest.fn().mockResolvedValue(auctionData),
    list: jest.fn().mockResolvedValue(auctionList),
    findById: jest.fn().mockResolvedValue(auctionData),
    delete: jest.fn().mockResolvedValue(auctionData),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [AuctionsModule, PrismaModule, EventEmitterModule.forRoot()],
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
    const data: UpdateAuctionDTO = {
      title: 'Test Auction',
      description: 'Test Description',
      endsAt: new Date(),
    };
    const auction = await controller.update(data, '123', null);

    expect(auction).toEqual(auctionData);
    expect(auctionsServiceMock.update).toHaveBeenCalledWith(data, '123', null);
  });

  it('should fail to update an auction', async () => {
    const data: UpdateAuctionDTO = {
      title: 'Test Auction',
      description: 'Test Description',
      endsAt: new Date(),
    };
    try {
      await controller.update(data, '1233', null);
    } catch (e) {
      expect(e.message).toEqual('Auction not found');
    }
    expect(auctionsServiceMock.update).toHaveBeenCalledWith(data, '1233', null);
  });

  it('should list all auctions', async () => {
    const auctions = await controller.list('123');

    expect(auctions.length).toBeGreaterThan(0);
    expect(auctions[0].id).toEqual(auctionList[0].id);
    expect(auctionsServiceMock.list).toHaveBeenCalled();
  });
  it('should fail getting an auction by id', async () => {
    const auction = await controller.getById(auctionData.id);

    expect(auction).toEqual(auctionData);
  });
  it('should fail getting an auction by id', async () => {
    auctionsServiceMock.findById.mockRejectedValue(
      new Error('Auction not found'),
    );

    try {
      await controller.getById('1234');
    } catch (e) {
      expect(e.message).toEqual('Auction not found');
    }
  });
  it('should delete auction', async () => {
    const auction = await controller.delete('123');

    expect(auction).toEqual(auctionData);
    expect(auctionsServiceMock.delete).toHaveBeenCalledWith('123');
  });
  it('should throw error deleting non existing auction', () => {
    auctionsServiceMock.delete.mockRejectedValue(
      new Error('Auction not found'),
    );
    expect(controller.delete('1234')).rejects.toThrow('Auction not found');
  });
});
