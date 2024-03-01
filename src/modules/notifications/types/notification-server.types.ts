import { NotificationEvent } from '../events/notification.events';
import { Notification } from '@prisma/client';

export interface NotificationsGatewayEmitEvents {
  [NotificationEvent.NEW_NOTIFICATION]: (data: Notification) => void;
}
