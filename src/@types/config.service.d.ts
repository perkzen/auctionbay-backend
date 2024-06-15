import '@nestjs/config';
import { EnvironmentVariables } from '@app/config/environment-variables/env-vars';

declare module '@nestjs/config' {
  export declare class ConfigService {
    get<T extends keyof EnvironmentVariables>(
      propertyPath: T,
    ): EnvironmentVariables[T] | undefined;
    get<T extends keyof EnvironmentVariables>(
      propertyPath: T,
      defaultValue: EnvironmentVariables[T],
    ): Exclude<EnvironmentVariables[T], undefined>;
    getOrThrow<T extends keyof EnvironmentVariables>(
      propertyPath: T,
    ): Exclude<EnvironmentVariables[T], undefined>;
    getOrThrow<T extends keyof EnvironmentVariables>(
      propertyPath: T,
      defaultValue: EnvironmentVariables[T],
    ): Exclude<EnvironmentVariables[T], undefined>;
  }
}
