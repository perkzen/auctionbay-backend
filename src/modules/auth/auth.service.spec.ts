import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SignupDTO } from './dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { AuthModule } from './auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

describe('AuthService', () => {
  let moduleRef: TestingModuleBuilder,
    authService: AuthService,
    app: TestingModule,
    db: PrismaService,
    userService: UsersService;

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
    db = app.get<PrismaService>(PrismaService);
    userService = app.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await db.user.deleteMany();

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
    const user = await authService.register(signupDTO);

    expect(user).toBeDefined();
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('firstname', signupDTO.firstname);
    expect(user).toHaveProperty('lastname', signupDTO.lastname);
    expect(user).toHaveProperty('email', signupDTO.email);
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

  it('should login a user', async () => {
    const user = await authService.validateUser(
      signupDTO.email,
      signupDTO.password,
    );

    const token = await authService.login(user);

    expect(token).toBeDefined();
    expect(token).toHaveProperty('access_token');
  });
});
