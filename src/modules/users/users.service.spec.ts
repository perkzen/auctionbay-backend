import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from './users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { faker } from '@faker-js/faker';
import { SignupDTO } from '../auth/dtos/signup.dto';
import { User } from '@prisma/client';
import { UploadModule } from '../upload/upload.module';
import { UploadService } from '../upload/upload.service';
import { ConfigModule } from '@nestjs/config';

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

  const imageUrl = faker.image.url();

  const uploadServiceMock = {
    upload: jest.fn().mockResolvedValue(imageUrl),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [
        UsersModule,
        PrismaModule,
        UploadModule,
        ConfigModule.forRoot({ isGlobal: true }),
      ],
    })
      .overrideProvider(UploadService)
      .useValue(uploadServiceMock);

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
      testUser.id,
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
        testUser.id,
      );
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.status).toEqual(401);
      expect(error.message).toEqual("Password doesn't match");
    }
  });
  it("should fail to update a user's profile", async () => {
    const updateProfileDTO = {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
    };

    try {
      await usersService.updateProfile(
        updateProfileDTO,
        faker.internet.email(),
      );
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
  it('should update a user profile', async () => {
    const updateProfileDTO = {
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      email: faker.internet.email(),
    };

    const user = await usersService.updateProfile(
      updateProfileDTO,
      testUser.id,
    );

    expect(user).toBeDefined();
    expect(user.firstname).toEqual(updateProfileDTO.firstname);
    expect(user.lastname).toEqual(updateProfileDTO.lastname);
    expect(user.email).toEqual(updateProfileDTO.email);
  });
  it('should update a user profile picture', async () => {
    const user = await usersService.updateProfilePicture(null, testUser.id);

    expect(uploadServiceMock.upload).toHaveBeenCalled();
    expect(user).toBeDefined();
    expect(user.imageUrl).toBe(imageUrl);
  });
});
