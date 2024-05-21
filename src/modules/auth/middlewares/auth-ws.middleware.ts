import { AuthService } from '../auth.service';
import { WsException } from '@nestjs/websockets';
import { Injectable } from '@nestjs/common';
import { AuthenticatedSocket, SocketMiddleware } from '../types/auth.types';

@Injectable()
export class AuthWsMiddleware {
  constructor(private readonly authService: AuthService) {}

  run(): SocketMiddleware {
    return async (socket, next) => {
      const token = socket.handshake.headers.authorization?.replace(
        'Bearer ',
        '',
      );

      if (!token) return next(new WsException('Unauthorized'));

      try {
        const user = await this.authService.verifyToken(token);
        if (!user) return next(new WsException('Unauthorized'));

        (socket as AuthenticatedSocket).userId = user.id;
        next();
      } catch (e) {
        next(new WsException('Unauthorized'));
      }
    };
  }
}
