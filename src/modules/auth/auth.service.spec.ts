import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDTO } from './dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { AuthModule } from './auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

describe('AuthService', () => {
  let moduleRef: TestingModuleBuilder,
    authService: AuthService,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService,
    user: User;

  const signupDTO: SignupDTO = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  beforeAll(async () => {
    moduleRef = Test.createTestingModule({
      imports: [UsersModule, PrismaModule, AuthModule],
    });

    app = await moduleRef.compile();
    authService = app.get<AuthService>(AuthService);
    userService = app.get<UsersService>(UsersService);
    db = app.get<PrismaService>(PrismaService);

    user = await userService.create(signupDTO);
  });

  afterAll(async () => {
    if (app) {
      app.flushLogs();
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(db).toBeDefined();
    expect(app).toBeDefined();
    expect(moduleRef).toBeDefined();
  });

  it('should register a user', async () => {
    const newUser = { ...signupDTO, email: faker.internet.email() };

    const user = await authService.register(newUser);

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('firstname', newUser.firstname);
    expect(user).toHaveProperty('lastname', newUser.lastname);
    expect(user).toHaveProperty('email', newUser.email);
  });

  it('should validate a user', async () => {
    const user = await authService.validateUser(
      signupDTO.email,
      signupDTO.password,
    );

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('firstname', signupDTO.firstname);
    expect(user).toHaveProperty('lastname', signupDTO.lastname);
    expect(user).toHaveProperty('email', signupDTO.email);
  });

  it('should fail to validate user', async () => {
    const user = await authService.validateUser(
      faker.internet.email(),
      faker.internet.password(),
    );

    expect(user).toBeNull();
  });

  it('should login a user', async () => {
    const token = await authService.login(user);
    expect(token).toBeDefined();
    expect(token).toHaveProperty('access_token');
  });
  it("should validate a user's token", async () => {
    const { access_token } = await authService.login(user);
    const verifiedUser = await authService.verifyToken(access_token);
    expect(verifiedUser).toBeDefined();
    expect(verifiedUser).toHaveProperty('id');
    expect(verifiedUser).toHaveProperty('firstname', signupDTO.firstname);
    expect(verifiedUser).toHaveProperty('lastname', signupDTO.lastname);
    expect(verifiedUser).toHaveProperty('email', signupDTO.email);
  });
  it('should fail to validate a user token', async () => {
    try {
      await authService.verifyToken(faker.string.uuid());
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  it("should fail to refresh a user's token", async () => {
    try {
      await authService.refreshToken({
        userId: faker.string.uuid(),
        email: faker.internet.email(),
      });
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
  it('should refresh a user token', async () => {
    const token = await authService.refreshToken({
      email: user.email,
      userId: user.id,
    });
    expect(token).toBeDefined();
    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('refreshToken');
  });
});
