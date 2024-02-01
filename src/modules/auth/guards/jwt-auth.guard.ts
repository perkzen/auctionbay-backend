import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SanitizedUser } from '../auth.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<T extends SanitizedUser, _>(err: Error, user: T, _info: _) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
