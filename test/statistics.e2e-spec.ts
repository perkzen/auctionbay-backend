import { INestApplication } from '@nestjs/common';
import { SanitizedUser } from '../src/modules/auth/types/auth.types';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { faker } from '@faker-js/faker';
import { SignupDTO } from '../src/modules/auth/dtos/signup.dto';
import { UploadService } from '../src/modules/upload/upload.service';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { PrismaModule } from '../src/modules/prisma/prisma.module';
import { UploadModule } from '../src/modules/upload/upload.module';
import * as request from 'supertest';
import { StatisticsModule } from '../src/modules/statistics/statistics.module';
import { StatisticsService } from '../src/modules/statistics/statistics.service';

describe('StatisticsController (e2e)', () => {
  let app: INestApplication,
    access_token: string,
    db: PrismaService,
    authService: AuthService,
    user: SanitizedUser;

  const signupDTO: SignupDTO = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: faker.internet.password(),
  };

  const imageUrl = faker.image.url();

  const uploadServiceMock = {
    upload: jest.fn().mockResolvedValue(imageUrl),
  };

  const statisticsServiceMock = {
    earningsByUser: jest.fn().mockResolvedValue(100),
    activeBidsByUser: jest.fn().mockResolvedValue(10),
    currentlyWinningBidsByUser: jest.fn().mockResolvedValue(5),
    postedAuctionsByUser: jest.fn().mockResolvedValue(20),
  } as jest.Mocked<
    Pick<
      StatisticsService,
      | 'earningsByUser'
      | 'activeBidsByUser'
      | 'currentlyWinningBidsByUser'
      | 'postedAuctionsByUser'
    >
  >;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        UploadModule,
        StatisticsModule,
      ],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock)
      .overrideProvider(StatisticsService)
      .useValue(statisticsServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();

    db = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);

    user = await authService.register(signupDTO);
    const res = await authService.login(user);
    access_token = res.accessToken;

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
    expect(user).toBeDefined();
    expect(access_token).toBeDefined();
  });

  describe('/statistics/me/earnings (GET)', () => {
    it('should fail because user is not authorized', () => {
      return request(app.getHttpServer())
        .get('/statistics/me/earnings')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should return earnings by user', async () => {
      return request(app.getHttpServer())
        .get('/statistics/me/earnings')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect({ earnings: 100 });
    });
  });

  describe('/statistics/me/posted-auctions (GET)', () => {
    it('should fail because user is not authorized', () => {
      return request(app.getHttpServer())
        .get('/statistics/me/posted-auctions')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should return posted auctions by user', async () => {
      return request(app.getHttpServer())
        .get('/statistics/me/posted-auctions')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect({ postedAuctions: 20 });
    });
  });

  describe('/statistics/me/active-bids (GET)', () => {
    it('should fail because user is not authorized', () => {
      return request(app.getHttpServer())
        .get('/statistics/me/active-bids ')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should return active bids by user', async () => {
      return request(app.getHttpServer())
        .get('/statistics/me/active-bids ')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect({ activeBids: 10 });
    });
  });

  describe('/statistics/me/winning-bids (GET)', () => {
    it('should fail because user is not authorized', () => {
      return request(app.getHttpServer())
        .get('/statistics/me/winning-bids')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should return currently winning bids by user', async () => {
      return request(app.getHttpServer())
        .get('/statistics/me/winning-bids')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect({ winningBids: 5 });
    });
  });
});
