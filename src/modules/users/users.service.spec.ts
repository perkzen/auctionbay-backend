import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from './users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { faker } from '@faker-js/faker';
import { SignupDTO } from '../auth/dtos/signup.dto';
import { User } from '@prisma/client';

describe('UsersService', () => {
  let moduleRef: TestingModuleBuilder,
    usersService: UsersService,
    app: TestingModule,
    db: PrismaService,
    testUser: User;

  const testUserDTO: SignupDTO = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [UsersModule, PrismaModule],
    });

    app = await moduleRef.compile();
    usersService = app.get<UsersService>(UsersService);
    db = app.get<PrismaService>(PrismaService);
    testUser = await usersService.create(testUserDTO);
  });

  afterAll(async () => {
    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(db).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: SignupDTO = {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const user = await usersService.create(dto);

    expect(user).toBeDefined();
    expect(user.firstname).toEqual(dto.firstname);
    expect(user.lastname).toEqual(dto.lastname);
    expect(user.email).toEqual(dto.email);
  });

  it('should find a user by email', async () => {
    const user = await usersService.findByEmail(testUser.email);

    expect(user).toBeDefined();
    expect(user.firstname).toEqual(testUser.firstname);
    expect(user.lastname).toEqual(testUser.lastname);
    expect(user.email).toEqual(testUser.email);
  });

  it('should not find a user by email', async () => {
    const user = await usersService.findByEmail(faker.internet.email());
    expect(user).toBeNull();
  });

  it('should update a user password', async () => {
    const newPassword = faker.internet.password();
    const oldPassword = testUserDTO.password;

    await usersService.updatePassword(
      {
        oldPassword,
        newPassword,
      },
      testUser.email,
    );
  });

  it('should not update a user password', async () => {
    const newPassword = faker.internet.password();
    const oldPassword = faker.internet.password();

    try {
      await usersService.updatePassword(
        {
          oldPassword,
          newPassword,
        },
        testUser.email,
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(401);
      expect(error.message).toEqual("Password doesn't match");
    }
  });
});
