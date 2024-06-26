import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthModule } from '@app/modules/auth/auth.module';
import { UsersModule } from '@app/modules/users/users.module';
import { PrismaModule } from '@app/modules/prisma/prisma.module';
import { SignupDTO } from '@app/modules/auth/dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { UsersService } from '@app/modules/users/users.service';
import { ConfigModule } from '@nestjs/config';

describe('AuthController (e2e)', () => {
  let app: INestApplication, userService: UsersService, db: PrismaService;

  const signupDto: SignupDTO = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UsersService>(UsersService);
    db = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await db.clearDatabase();
    app.flushLogs();
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    afterAll(async () => {
      await db.user.deleteMany({});
    });

    it('should fail because user is not registered', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'domen@mail.com',
          password: 'password',
        })
        .expect(401)
        .expect({
          message: 'Invalid credentials',
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should login successfully', async () => {
      const user = await userService.create(signupDto);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: user.email,
          password: signupDto.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
        });
    });
  });
  describe('/auth/signup (POST)', () => {
    afterEach(async () => {
      await db.user.deleteMany();
    });

    it('should fail because email is already registered', async () => {
      await userService.create(signupDto);

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(400)
        .expect({
          statusCode: 400,
          message: 'User with this email already exists',
          error: 'Bad Request',
        });
    });
    it('should register successfully', async () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', signupDto.email);
          expect(res.body).toHaveProperty('firstname', signupDto.firstname);
          expect(res.body).toHaveProperty('lastname', signupDto.lastname);
        });
    });
  });

  describe('/auth/refresh-token (POST)', () => {
    it('should fail because token is invalid', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh-token')
        .send({
          refreshToken: 'invalid',
        })
        .expect(401);
    });
  });
  it('should refresh token successfully', async () => {
    const user = await userService.create(signupDto);
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: signupDto.password,
      });

    return request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({
        refreshToken: loginRes.body.refreshToken,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
        expect(res.body).toHaveProperty('refreshToken');
      });
  });
});
