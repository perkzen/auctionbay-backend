import { SignupDTO } from '../src/modules/auth/dtos/signup.dto';
import { faker } from '@faker-js/faker';
import { AuthService } from '../src/modules/auth/auth.service';

export const createNewUser = async (authService: AuthService) => {
  const signupDTO: SignupDTO = {
    email: faker.internet.email(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    password: faker.internet.password(),
  };

  const user = await authService.register(signupDTO);
  const res = await authService.login(user);
  const access_token = res.accessToken;

  return {
    user,
    access_token,
  };
};
