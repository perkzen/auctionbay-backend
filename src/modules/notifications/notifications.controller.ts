import { Controller, Delete, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { User } from '@app/common/decorators';
import { NotificationDTO } from './dtos/notification.dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all notifications from user' })
  @ApiOkResponse({
    description: 'Notifications retrieved successfully',
    type: NotificationDTO,
    isArray: true,
  })
  @Get('/me')
  async getNotifications(@User('userId') userId: string) {
    const list = await this.notificationsService.findByUserId(userId);
    return serializeToDto(NotificationDTO, list);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear all notifications from user' })
  @ApiOkResponse({ description: 'Notifications cleared successfully' })
  @Delete('/me')
  async clearNotifications(@User('userId') userId: string) {
    this.notificationsService.clearAll(userId);
  }
}
