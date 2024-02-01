import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import settings from 'src/app.settings';
import { JwtPayload, JwtUser } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: settings.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtUser> {
    return { userId: payload.sub, email: payload.email };
  }
}
