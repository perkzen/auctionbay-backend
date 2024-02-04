import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload, JwtUser } from '../types/auth.types';
import settings from '../../../app.settings';

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
