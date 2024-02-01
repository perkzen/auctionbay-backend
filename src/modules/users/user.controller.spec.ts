import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { UserController } from './user.controller';
import { faker } from '@faker-js/faker';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';

describe('UserController', () => {
  let moduleRef: TestingModuleBuilder,
    app: TestingModule,
    controller: UserController;

  const userData = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
  };

  const userServiceMock = {
    findByEmail: jest.fn().mockResolvedValue(userData),
    create: jest.fn().mockResolvedValue(userData),
    updatePassword: jest.fn().mockResolvedValue({}),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
      .useValue(userServiceMock);

    app = await moduleRef.compile();
    controller = app.get<UserController>(UserController);
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

  it('should find a user by email', async () => {
    const user = await controller.me(userData.email);

    expect(user).toEqual(userData);
    expect(userServiceMock.findByEmail).toHaveBeenCalledWith(userData.email);
  });

  it('should update a user password', async () => {
    const data = {
      oldPassword: faker.internet.password(),
      newPassword: faker.internet.password(),
    };

    const user = await controller.changePassword(data, userData.email);

    expect(user).toEqual({});
    expect(userServiceMock.updatePassword).toHaveBeenCalledWith(
      data,
      userData.email,
    );
  });
});