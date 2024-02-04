import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { faker } from '@faker-js/faker';
import { AuthModule } from './auth.module';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SignupDTO } from './dtos/signup.dto';
import { AuthService } from './auth.service';
import { LoginRequest } from './types/auth.types';

describe('AuthController', () => {
  let moduleRef: TestingModuleBuilder,
    controller: AuthController,
    app: TestingModule;

  const loginReq = {
    user: {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
    },
  } as LoginRequest;

  const signupDTO: SignupDTO = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  const userData = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const authServiceMock = {
    login: jest.fn().mockResolvedValue({ access_token: faker.string.uuid() }),
    register: jest.fn().mockResolvedValue(userData),
    validateUser: jest.fn().mockResolvedValue(userData),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [AuthModule, UsersModule, PrismaModule],
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
    expect(user).toEqual({ access_token: expect.any(String) });
    expect(authServiceMock.login).toHaveBeenCalledWith(loginReq.user);
  });
});
