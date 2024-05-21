import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { AuthService } from '@app/modules/auth/auth.service';
import { SanitizedUser } from '@app/modules/auth/types/auth.types';
import { SignupDTO } from '@app/modules/auth/dtos/signup.dto';
import { UsersModule } from '@app/modules/users/users.module';
import { AuthModule } from '@app/modules/auth/auth.module';
import { PrismaModule } from '@app/modules/prisma/prisma.module';
import { UploadModule } from '@app/modules/upload/upload.module';
import { UploadService } from '@app/modules/upload/upload.service';

describe('UsersController (e2e)', () => {
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

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule, UsersModule, PrismaModule, UploadModule],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock)
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
        .expect({
          message: "Password doesn't match",
          error: 'Unauthorized',
          statusCode: 401,
        });
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
  describe('/users/me (PUT)', () => {
    it('should fail because user is not logged in', () => {
      return request(app.getHttpServer())
        .put('/users/me')
        .send({
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          email: user.email,
        })
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
    it('should update user profile', async () => {
      const updatedUser = {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: user.email,
      };

      return request(app.getHttpServer())
        .put('/users/me')
        .set('Authorization', `Bearer ${access_token}`)
        .send(updatedUser)
        .expect(200)
        .expect(updatedUser);
    });
  });
  describe('/users/me/update-profile-picture (PUT)', () => {
    it('should fail because user is not logged in', () => {
      return request(app.getHttpServer())
        .put('/users/me/update-profile-picture')
        .expect(401)
        .expect({
          message: "You don't have access to this",
          error: 'Unauthorized',
          statusCode: 401,
        });
    });
  });
});
