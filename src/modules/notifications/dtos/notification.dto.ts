import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';

export class NotificationDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  data: JsonValue;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}
