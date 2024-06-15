import { INestApplication } from '@nestjs/common';
import { SanitizedUser } from '@app/modules/auth/types/auth.types';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { AuthService } from '@app/modules/auth/auth.service';
import { faker } from '@faker-js/faker';
import { SignupDTO } from '@app/modules/auth/dtos/signup.dto';
import { PrismaModule } from '@app/modules/prisma/prisma.module';
import { Test } from '@nestjs/testing';
import { AuthModule } from '@app/modules/auth/auth.module';
import { UsersModule } from '@app/modules/users/users.module';
import request from 'supertest';
import { AuctionsModule } from '@app/modules/auctions/auctions.module';
import { AuctionsService } from '@app/modules/auctions/services/auctions.service';
import { Auction } from '@prisma/client';
import { UploadModule } from '@app/modules/upload/upload.module';
import { UploadService } from '@app/modules/upload/upload.service';
import { BidsService } from '@app/modules/bids/services/bids.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { createNewUser } from './utils';
import { ConfigModule } from '@nestjs/config';

describe('AuctionsController (e2e)', () => {
  let app: INestApplication,
    access_token: string,
    db: PrismaService,
    authService: AuthService,
    auctionService: AuctionsService,
    bidService: BidsService,
    user: SanitizedUser;

  const signupDTO: SignupDTO = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: faker.internet.password(),
  };

  const uploadServiceMock = {
    upload: jest.fn().mockResolvedValue(faker.image.url()),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        AuctionsModule,
        AuthModule,
        UsersModule,
        PrismaModule,
        UploadModule,
        EventEmitterModule.forRoot(),
      ],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();

    db = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    auctionService = app.get<AuctionsService>(AuctionsService);
    bidService = app.get<BidsService>(BidsService);

    await app.init();
  });

  beforeEach(async () => {
    user = await authService.register(signupDTO);
    const res = await authService.login(user);
    access_token = res.accessToken;
  });

  afterEach(async () => {
    await db.user.delete({ where: { id: user.id } });
  });

  afterAll(async () => {
    app.flushLogs();
    await db.clearDatabase();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(db).toBeDefined();
    expect(authService).toBeDefined();
    expect(user).toBeDefined();
    expect(access_token).toBeDefined();
    expect(auctionService).toBeDefined();
    expect(bidService).toBeDefined();
  });

  describe('/auctions (GET)', () => {
    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).get('/auctions').expect(401);
    });
    it('should return an empty array', () => {
      return request(app.getHttpServer())
        .get('/auctions')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
          expect(res.body).toEqual([]);
        });
    });
    it('should return an array of auctions', async () => {
      const auction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .get('/auctions')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(auction.id);
        });
    });
  });

  describe('/auctions (POST)', () => {
    it('should create an auction', async () => {
      const auction = {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        startingPrice: 100,
        endsAt: new Date(),
        imageUrl: faker.image.url(),
      };

      return request(app.getHttpServer())
        .post('/auctions')
        .set('Authorization', `Bearer ${access_token}`)
        .send(auction)
        .expect(201);
    });

    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).post('/auctions').expect(401);
    });
  });

  describe('/auctions/:id (PUT)', () => {
    it('should update an auction', async () => {
      const auction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .put(`/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
          imageUrl: faker.image.url(),
        })
        .expect(200);
    });

    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).put('/auctions/1').expect(401);
    });
    it('should fail because of user does not have permission to change auction ', async () => {
      return request(app.getHttpServer())
        .put('/auctions/some-other-id')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
          imageUrl: faker.image.url(),
        })
        .expect(401);
    });
  });

  describe('/auctions/:id/bid (POST)', () => {
    it('should not allow owner do bid on his auction', async () => {
      const auction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .post(`/auctions/${auction.id}/bid`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({ amount: 200 })
        .expect(401)
        .expect({
          message: 'You are the owner of this auction, you cannot bid on it.',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });

    it("should not allow to bid on auction that doesn't exist", async () => {
      return request(app.getHttpServer())
        .post(`/auctions/1/bid`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({ amount: 200 })
        .expect(404)
        .expect({
          message: 'Auction not found',
          error: 'Not Found',
          statusCode: 404,
        });
    });
    it("it should not allow to bid on auction that isn't active", async () => {
      const auction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      await db.auction.update({
        where: { id: auction.id },
        data: { status: 'CLOSED' },
      });

      const newUser = await createNewUser(authService);

      return request(app.getHttpServer())
        .post(`/auctions/${auction.id}/bid`)
        .set('Authorization', `Bearer ${newUser.access_token}`)
        .send({ amount: 200 })
        .expect(400)
        .expect({
          message: 'Auction is not active',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).post('/auctions/1/bid').expect(401);
    });
    it('should bid on an auction', async () => {
      const newUserId = (
        await authService.register({
          ...signupDTO,
          email: faker.internet.email(),
        })
      ).id;
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        newUserId,
        null,
      );

      expect(newAuction).toBeDefined();

      return request(app.getHttpServer())
        .post(`/auctions/${newAuction.id}/bid`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({ amount: 200 })
        .expect(201);
    });
  });
  describe('/auctions/:id (GET)', () => {
    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).get('/auctions/1').expect(401);
    });
    it('should return an auction', async () => {
      const auction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .get(`/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(auction.id);
        });
    });

    it('should return 404', async () => {
      return request(app.getHttpServer())
        .get(`/auctions/1`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(404)
        .expect({
          message: 'Auction not found',
          error: 'Not Found',
          statusCode: 404,
        });
    });
  });
  describe('/auctions/me (GET)', () => {
    it("should return empty array for user's auctions", async () => {
      return request(app.getHttpServer())
        .get(`/auctions/me`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
          expect(res.body).toEqual([]);
        });
    });

    it("should return an array of user's auctions", async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .get(`/auctions/me`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(newAuction.id);
        });
    });
    it('should return 401', async () => {
      return request(app.getHttpServer()).get(`/auctions/me`).expect(401);
    });
  });

  describe('/auctions/me/won (GET)', () => {
    it("should return empty array for user's won auctions", async () => {
      return request(app.getHttpServer())
        .get(`/auctions/me/won`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
          expect(res.body).toEqual([]);
        });
    });

    it("should return an array of user's won auctions", async () => {
      return request(app.getHttpServer())
        .get(`/auctions/me/won`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
          expect(res.body).toEqual([]);
        });
    });

    it("should return an array of user's won auctions", async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      const newUser = await createNewUser(authService);

      await bidService.create(newAuction.id, newUser.user.id, 200);

      await auctionService.updateAuctionStatuses();

      return request(app.getHttpServer())
        .get(`/auctions/me/won`)
        .set('Authorization', `Bearer ${newUser.access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(newAuction.id);
        });
    });

    it('should return 401', async () => {
      return request(app.getHttpServer()).get(`/auctions/me/won`).expect(401);
    });
  });

  describe('/auctions/me/bidding (GET)', () => {
    it("should return empty array for user's bidding auctions", async () => {
      return request(app.getHttpServer())
        .get(`/auctions/me/bidding`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
          expect(res.body).toEqual([]);
        });
    });
    it("should return an array of user's bidding auctions", async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      const newUser = await createNewUser(authService);

      await bidService.create(newAuction.id, newUser.user.id, 200);

      return request(app.getHttpServer())
        .get(`/auctions/me/bidding`)
        .set('Authorization', `Bearer ${newUser.access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].id).toEqual(newAuction.id);
        });
    });
    it('should return 401', async () => {
      return request(app.getHttpServer())
        .get(`/auctions/me/bidding`)
        .expect(401);
    });
  });

  describe('/auctions/:id/auto-bid (POST)', () => {
    let newAuction: Auction,
      newUser: SanitizedUser,
      newAccessToken: string,
      auctionOwnerId: string;

    beforeAll(async () => {
      auctionOwnerId = (
        await authService.register({
          ...signupDTO,
          email: faker.internet.email(),
        })
      ).id;

      newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        auctionOwnerId,
        null,
      );

      newUser = await authService.register({
        ...signupDTO,
        email: faker.internet.email(),
      });
      const res = await authService.login(newUser);
      newAccessToken = res.accessToken;
    });

    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer())
        .post(`/auctions/${newAuction.id}/auto-bid`)
        .send({ incrementAmount: 100, maxAmount: 200 })
        .expect(401);
    });
    it('should fail if invalid data', async () => {
      return request(app.getHttpServer())
        .post(`/auctions/${newAuction.id}/auto-bid`)
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ incrementAmount: 100, maxAmount: 50 })
        .expect(400)
        .expect({
          message: 'Max amount should be greater than increment amount.',
          error: 'Bad Request',
          statusCode: 400,
        });
    });
    it('should create an auto bid', async () => {
      return request(app.getHttpServer())
        .post(`/auctions/${newAuction.id}/auto-bid`)
        .set('Authorization', `Bearer ${newAccessToken}`)
        .send({ incrementAmount: 100, maxAmount: 200 })
        .expect(201);
    });
  });
  describe('auctions/:id/bids (GET)', () => {
    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).get('/auctions/1/bids').expect(401);
    });
    it('should return an array of bids', async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      const newUser = await createNewUser(authService);

      await bidService.create(newAuction.id, newUser.user.id, 200);

      return request(app.getHttpServer())
        .get(`/auctions/${newAuction.id}/bids`)
        .set('Authorization', `Bearer ${newUser.access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].amount).toEqual(200);
        });
    });
    it('should return empty array if auction not found', async () => {
      return request(app.getHttpServer())
        .get('/auctions/1/bids')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveLength(0);
          expect(res.body).toEqual([]);
        });
    });
  });
  describe('auctions/:id (DELETE)', () => {
    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).delete('/auctions/1').expect(401);
    });
    it('should delete acutoin', async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .delete(`/auctions/${newAuction.id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toEqual(newAuction.id);
        });
    });
    it('should only allow owner to delete auction', async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      const newUser = await createNewUser(authService);

      return request(app.getHttpServer())
        .delete(`/auctions/${newAuction.id}`)
        .set('Authorization', `Bearer ${newUser.access_token}`)
        .expect(401)
        .expect({
          message: 'You do not have permission for this auction.',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
  });
  describe('/auctions/:id (PUT)', () => {
    it('should fail because of missing authorization header', async () => {
      return request(app.getHttpServer()).put('/auctions/1').expect(401);
    });
    it('should fail because of user does not have permission to change auction', async () => {
      return request(app.getHttpServer())
        .put('/auctions/some-other-id')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          endsAt: new Date(),
        })
        .expect(401);
    });
    it('should update an auction', async () => {
      const newAuction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          endsAt: new Date(),
        },
        user.id,
        null,
      );

      return request(app.getHttpServer())
        .put(`/auctions/${newAuction.id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          endsAt: new Date(),
        })
        .expect(200);
    });
  });
});
