import { INestApplication } from '@nestjs/common';
import { SanitizedUser } from '../src/modules/auth/auth.types';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { faker } from '@faker-js/faker';
import { SignupDTO } from '../src/modules/auth/dtos/signup.dto';
import { PrismaModule } from '../src/modules/prisma/prisma.module';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import * as request from 'supertest';
import { AuctionsModule } from '../src/modules/auctions/auctions.module';
import { AuctionsService } from '../src/modules/auctions/auctions.service';

describe('AuctionsController', () => {
  let app: INestApplication,
    access_token: string,
    db: PrismaService,
    authService: AuthService,
    auctionService: AuctionsService,
    user: SanitizedUser;

  const signupDTO: SignupDTO = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: faker.internet.password(),
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AuctionsModule, AuthModule, UsersModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    db = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    auctionService = app.get<AuctionsService>(AuctionsService);

    user = await authService.register(signupDTO);
    const res = await authService.login(user);
    access_token = res.access_token;

    await app.init();
  });

  afterAll(async () => {
    await db.user.deleteMany();
    await db.auction.deleteMany();
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(db).toBeDefined();
    expect(authService).toBeDefined();
    expect(user).toBeDefined();
    expect(access_token).toBeDefined();
  });

  afterEach(async () => {
    await db.auction.deleteMany();
  });

  describe('/auctions (GET)', () => {
    it('should return an empty array', () => {
      return request(app.getHttpServer())
        .get('/auctions')
        .expect(200)
        .expect([]);
    });
    it('should return an array of auctions', async () => {
      const auction = await auctionService.create(
        {
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          duration: 60,
          imageUrl: faker.image.url(),
        },
        user.id,
      );

      return request(app.getHttpServer())
        .get('/auctions')
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
        duration: 60,
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
          duration: 60,
          imageUrl: faker.image.url(),
        },
        user.id,
      );

      return request(app.getHttpServer())
        .put(`/auctions/${auction.id}`)
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          startingPrice: 100,
          duration: 60,
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
          duration: 60,
          imageUrl: faker.image.url(),
        })
        .expect(401);
    });
  });
});
