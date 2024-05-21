import { ApiProperty } from '@nestjs/swagger';
import { JsonValue } from '@prisma/client/runtime/library';
import { IsDateString, IsJSON, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class NotificationDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty()
  @IsJSON()
  @Expose()
  data: JsonValue;

  @ApiProperty()
  @IsString()
  @Expose()
  userId: string;

  @ApiProperty()
  @IsDateString()
  @Expose()
  createdAt: Date;
}
