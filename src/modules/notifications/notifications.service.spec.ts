import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AuctionsService } from '../auctions/services/auctions.service';
import { UploadModule } from '../upload/upload.module';
import { NotificationsModule } from './notifications.module';
import { AuctionsModule } from '../auctions/auctions.module';
import { faker } from '@faker-js/faker';
import { UploadService } from '../upload/upload.service';
import { createAuctionClosedNotification } from './types/create-auction-closed-notification.type';
import { BidsService } from '../bids/services/bids.service';
import { CreateAuctionDTO } from '../auctions/dtos/create-auction.dto';
import { NotificationsGateway } from './gateway/notifications.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('NotificationsService', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService,
    notificationsService: NotificationsService,
    auctionService: AuctionsService,
    bidService: BidsService,
    notificationId: string,
    userId: string,
    auctionId: string,
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

  const notificationGatewayMock = {
    notifyUsers: jest.fn(),
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
        NotificationsModule,
        AuctionsModule,
        UploadModule,
        EventEmitterModule.forRoot(),
      ],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock)
      .overrideProvider(NotificationsGateway)
      .useValue(notificationGatewayMock);

    app = await moduleRef.compile();
    db = app.get<PrismaService>(PrismaService);
    userService = app.get<UsersService>(UsersService);
    notificationsService = app.get<NotificationsService>(NotificationsService);
    auctionService = app.get<AuctionsService>(AuctionsService);
    bidService = app.get<BidsService>(BidsService);

    userId = await createNewUser();

    bidderId = await createNewUser();

    const auction = await auctionService.create(auctionDTO, userId, null);
    auctionId = auction.id;

    const bid = await bidService.create(auction.id, bidderId, 200);

    notificationId = (
      await db.notification.create({
        data: createAuctionClosedNotification({
          ...bid,
          auction: { title: auction.title, id: auction.id, imageUrl: '' },
        }),
      })
    ).id;
  });

  afterAll(async () => {
    await db.clearDatabase();

    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(notificationsService).toBeDefined();
    expect(db).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
    expect(userId).toBeDefined();
    expect(notificationId).toBeDefined();
    expect(auctionService).toBeDefined();
    expect(bidService).toBeDefined();
  });
  it('should find notifications by user id', async () => {
    const notifications = await notificationsService.findByUserId(bidderId);
    expect(notifications).toBeDefined();
    expect(notifications.length).toBeGreaterThan(0);
  });
  it("should return an empty array if user doesn't have any notifications", async () => {
    const notifications = await notificationsService.findByUserId(
      faker.string.uuid(),
    );
    expect(notifications).toBeDefined();
    expect(notifications.length).toEqual(0);
  });
  it('should find notifications by auction id', async () => {
    const notifications = await notificationsService.findByAuctionId(auctionId);
    expect(notifications).toBeDefined();
    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications[0].id).toEqual(notificationId);
  });
  it("should return an empty array if auction doesn't have any notifications", async () => {
    const notifications = await notificationsService.findByAuctionId(
      faker.string.uuid(),
    );
    expect(notifications).toBeDefined();
    expect(notifications.length).toEqual(0);
  });
  it('should clear all notifications for a user', async () => {
    const notifications = await notificationsService.clearAll(bidderId);
    expect(notifications).toBeDefined();
    expect(notifications.count).toBeGreaterThan(0);
  });
  it("should create many notifications and return the created notifications' count", async () => {
    const newBidderId = await createNewUser();
    const bid = await bidService.create(auctionId, newBidderId, 500);

    const res = await db.notification.createMany({
      data: [
        createAuctionClosedNotification({
          ...bid,
          auction: { title: 'test', id: auctionId, imageUrl: '' },
        }),
        createAuctionClosedNotification({
          ...bid,
          auction: { title: 'test', id: auctionId, imageUrl: '' },
        }),
      ],
    });

    const notifications = await notificationsService.findByAuctionId(auctionId);
    expect(notifications).toBeDefined();
    expect(notifications.length).toBe(res.count);
  });
  it("should not call notifyUsers if there aren't any new notifications", async () => {
    const auction = await auctionService.create(auctionDTO, userId, null);
    await notificationsService.sendAuctionClosedNotification(auction.id, []);
    expect(notificationGatewayMock.notifyUsers).not.toHaveBeenCalled();
  });
  it('should send auction closed notifications to users', async () => {
    const newBidderId = await createNewUser();
    const bid = await bidService.create(auctionId, newBidderId, 600);

    await notificationsService.sendAuctionClosedNotification(auctionId, [
      {
        ...bid,
        auction: { title: 'test', id: auctionId, imageUrl: '' },
      },
      {
        ...bid,
        auction: { title: 'test', id: auctionId, imageUrl: '' },
      },
    ]);

    expect(notificationGatewayMock.notifyUsers).toHaveBeenCalled();
  });
});
