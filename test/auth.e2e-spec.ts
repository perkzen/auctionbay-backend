import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { PrismaModule } from '../src/modules/prisma/prisma.module';
import { SignupDTO } from '../src/modules/auth/dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { UsersService } from '../src/modules/users/users.service';
import { cleanupDatabase } from './utils/cleanup-database';

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
      imports: [AuthModule, UsersModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UsersService>(UsersService);
    db = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await cleanupDatabase(db);
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    afterAll(async () => {
      await db.user.deleteMany();
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
          expect(res.body).toHaveProperty('access_token');
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
});
