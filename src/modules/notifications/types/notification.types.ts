import { Notification as DbNotification } from '@prisma/client';

export type CreateNotification<T> = Omit<DbNotification, 'id' | 'createdAt'> & {
  data: T;
};

export type Notification<T> = DbNotification & {
  data: T;
};
