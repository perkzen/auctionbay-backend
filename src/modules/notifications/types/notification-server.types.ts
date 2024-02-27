import { NotificationEvent } from '../events/notification.events';
import { Notification } from '@prisma/client';

export interface EmitEvents {
  [NotificationEvent.NEW_NOTIFICATION]: (data: Notification) => void;
}
