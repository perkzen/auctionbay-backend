import { ClassConstructor, plainToInstance } from 'class-transformer';

export function serializeToDto<T, V extends Array<unknown>>(
  dto: ClassConstructor<T>,
  obj: V,
): T[];
export function serializeToDto<T, V>(dto: ClassConstructor<T>, obj: V): T;
export function serializeToDto<T, V>(
  dto: ClassConstructor<T>,
  obj: V | V[],
): T | T[] {
  return plainToInstance(dto, obj, { excludeExtraneousValues: true });
}
