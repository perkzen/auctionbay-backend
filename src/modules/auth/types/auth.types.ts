import { User } from '@prisma/client';
import { Socket } from 'socket.io';

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

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;
export type AuthenticatedSocket = Socket & { userId: string };
