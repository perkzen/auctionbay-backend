import { User } from '@prisma/client';

export type SanitizedUser = Omit<User, 'password'>;

export type JwtPayload = {
  sub: string;
  email: string;
};

export type LoginRequest = Request & { user: SanitizedUser };

export type JwtUser = {
  userId: string;
  email: string;
};
