import { Environment } from '@app/config/environment-variables/enums/env.enum';

export const isProdEnv = (): boolean =>
  process.env.NODE_ENV === Environment.PRODUCTION;
export const isDevEnv = (): boolean =>
  process.env.NODE_ENV === Environment.DEVELOPMENT;
export const isTestEnv = (): boolean =>
  process.env.NODE_ENV === Environment.TEST;
