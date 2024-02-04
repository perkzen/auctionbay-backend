import { User } from '@prisma/client';
import { SanitizedUser } from '../types/auth.types';
import * as bcrypt from 'bcrypt';

export const sanitizeUser = (user: User): SanitizedUser => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
