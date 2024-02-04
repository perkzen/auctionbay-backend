import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from 'src/modules/auth/types/auth.types';

export const User = createParamDecorator(
  (data: keyof JwtUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
