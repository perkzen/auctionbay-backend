import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { AuthService } from '../auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'ws') {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.headers.authorization?.replace(
      'Bearer ',
      '',
    );

    if (!token) {
      return false;
    }

    const verified = await this.authService.verifyToken(token);

    return !!verified;
  }
}
