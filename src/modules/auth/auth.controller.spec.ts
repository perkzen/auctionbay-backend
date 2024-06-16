import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { faker } from '@faker-js/faker';
import { AuthModule } from './auth.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SignupDTO } from './dtos/signup.dto';
import { AuthService } from './auth.service';
import { SanitizedUser } from './types/auth.types';
import { UserDTO } from '@app/modules/users/dtos/user.dto';
import { LoginResponseDTO } from '@app/modules/auth/dtos/login-response.dto';
import { ConfigModule } from '@nestjs/config';

describe('AuthController', () => {
  let moduleRef: TestingModuleBuilder,
    controller: AuthController,
    app: TestingModule;

  const loginReq = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  } as SanitizedUser;

  const signupDTO: SignupDTO = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const userData: UserDTO = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    imageUrl: faker.image.url(),
    createdAt: faker.date.recent(),
  };
  const refreshTokenResponse = {
    accessToken: faker.string.uuid(),
    refreshToken: faker.string.uuid(),
  };

  const loginResponse: LoginResponseDTO = {
    ...userData,
    accessToken: 'test',
    refreshToken: 'test',
  };

  const authServiceMock = {
    login: jest.fn().mockResolvedValue(loginResponse),
    register: jest.fn().mockResolvedValue(userData),
    validateUser: jest.fn().mockResolvedValue(userData),
    refreshToken: jest.fn().mockResolvedValue(refreshTokenResponse),
  } as jest.Mocked<
    Pick<AuthService, 'login' | 'register' | 'validateUser' | 'refreshToken'>
  >;

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [
        AuthModule,
        UsersModule,
        PrismaModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    })
      .overrideProvider(AuthService)
      .useValue(authServiceMock);

    app = await moduleRef.compile();
    controller = app.get<AuthController>(AuthController);
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

  it('should register a user', async () => {
    const user = await controller.signup(signupDTO);
    expect(user).toEqual(userData);
    expect(authServiceMock.register).toHaveBeenCalledWith(signupDTO);
  });

  it('should login a user', async () => {
    const user = await controller.login(loginReq);
    expect(user.accessToken).toBeDefined();
    expect(user.refreshToken).toBeDefined();
    expect(authServiceMock.login).toHaveBeenCalledWith(loginReq);
  });
  it("should refresh a user's token", async () => {
    const user = await controller.refreshToken({
      userId: userData.id,
      email: userData.email,
    });
    expect(user).toEqual(refreshTokenResponse);
  });
});
