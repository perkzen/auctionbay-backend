import { Controller, Delete, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { User } from '../../common/decorators';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications from user' })
  @Get('/me')
  async getNotifications(@User('userId') userId: string) {
    return this.notificationsService.findByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear all notifications from user' })
  @Delete('/me')
  async clearNotifications(@User('userId') userId: string) {
    return this.notificationsService.clearAll(userId);
  }
}
