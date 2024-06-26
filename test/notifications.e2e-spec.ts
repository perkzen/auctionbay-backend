import { INestApplication } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { AuthService } from '@app/modules/auth/auth.service';
import { SanitizedUser } from '@app/modules/auth/types/auth.types';
import { SignupDTO } from '@app/modules/auth/dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { UploadService } from '@app/modules/upload/upload.service';
import { Test } from '@nestjs/testing';
import { AuthModule } from '@app/modules/auth/auth.module';
import { UsersModule } from '@app/modules/users/users.module';
import { PrismaModule } from '@app/modules/prisma/prisma.module';
import { UploadModule } from '@app/modules/upload/upload.module';
import { NotificationsModule } from '@app/modules/notifications/notifications.module';
import { createAuctionClosedNotification } from '@app/modules/notifications/types/create-auction-closed-notification.type';
import { BidsService } from '@app/modules/bids/services/bids.service';
import { AuctionsService } from '@app/modules/auctions/services/auctions.service';
import { CreateAuctionDTO } from '@app/modules/auctions/dtos/create-auction.dto';
import { AuctionsModule } from '@app/modules/auctions/auctions.module';
import request from 'supertest';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { createNewUser } from './utils';
import { ConfigModule } from '@nestjs/config';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication,
    access_token: string,
    db: PrismaService,
    authService: AuthService,
    bidService: BidsService,
    auctionService: AuctionsService,
    user: SanitizedUser;

  const signupDTO: SignupDTO = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: faker.internet.password(),
  };

  const auctionDTO: CreateAuctionDTO = {
    title: 'Test Auction',
    description: 'Test Description',
    endsAt: new Date(),
    startingPrice: 100,
  };

  const imageUrl = faker.image.url();

  const uploadServiceMock = {
    upload: jest.fn().mockResolvedValue(imageUrl),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        UploadModule,
        NotificationsModule,
        AuctionsModule,
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();

    db = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    bidService = app.get<BidsService>(BidsService);
    auctionService = app.get<AuctionsService>(AuctionsService);

    user = await authService.register(signupDTO);

    const auction = await auctionService.create(auctionDTO, user.id, null);

    const bidder = await createNewUser(authService);
    access_token = bidder.access_token;

    const bid = await bidService.create(auction.id, bidder.user.id, 200);

    await db.notification.create({
      data: createAuctionClosedNotification({
        ...bid,
        auction: { title: auction.title, id: auction.id, imageUrl },
      }),
    });

    await app.init();
  });

  afterAll(async () => {
    await db.clearDatabase();
    app.flushLogs();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(db).toBeDefined();
    expect(authService).toBeDefined();
    expect(bidService).toBeDefined();
    expect(auctionService).toBeDefined();
  });

  describe('/notifications/me (GET)', () => {
    it('should fail because user is not logged in', () => {
      return request(app.getHttpServer())
        .get('/notifications/me')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should return user notifications', async () => {
      return request(app.getHttpServer())
        .get('/notifications/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
        });
    });
  });
  describe('/notifications/me (DELETE)', () => {
    it('should fail because user is not logged in', () => {
      return request(app.getHttpServer())
        .delete('/notifications/me')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should delete user notifications', async () => {
      return request(app.getHttpServer())
        .delete('/notifications/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200);
    });
  });
});
