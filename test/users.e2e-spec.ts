import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../src/modules/prisma/prisma.module';
import { UsersModule } from '../src/modules/users/users.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { AuthModule } from '../src/modules/auth/auth.module';
import { SignupDTO } from '../src/modules/auth/dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { SanitizedUser } from '../src/modules/auth/auth.types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('UsersController', () => {
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UsersModule, PrismaModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    db = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);

    user = await authService.register(signupDTO);
    const res = await authService.login(user);
    access_token = res.access_token;

    await app.init();
  });

  afterAll(async () => {
    await db.user.deleteMany();
    await app.close();
  });

  describe('/users/me (GET)', () => {
    it('should fail because user is not logged in', () => {
      return request(app.getHttpServer()).get('/users/me').expect(401).expect({
        message: "You don't have access to this",
        error: 'Unauthorized',
        statusCode: 401,
      });
    });
    it('should return user data', async () => {
      return request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${access_token}`)
        .expect(200)
        .expect(JSON.stringify(user));
    });
  });

  describe('/users/update-password (PUT)', () => {
    it('should fail because user is not logged in', () => {
      return request(app.getHttpServer())
        .put('/users/me/update-password')
        .send({
          oldPassword: signupDTO.password,
          newPassword: 'newPassword',
        })
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should fail because old password is incorrect', () => {
      return request(app.getHttpServer())
        .put('/users/me/update-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          oldPassword: 'wrongPassword',
          newPassword: 'newPassword',
        })
        .expect(401)
        .expect({ statusCode: 401, message: "Password doesn't match" });
    });
    it('should update password successfully', async () => {
      request(app.getHttpServer())
        .put('/users/me/update-password')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
          oldPassword: signupDTO.password,
          newPassword: faker.internet.password(),
        })
        .expect(200);
    });
  });
});
