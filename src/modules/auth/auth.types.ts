import { User } from '@prisma/client';

export type SanitizedUser = Omit<User, 'password'>;

export type UserRequest = Request & { user: SanitizedUser };
