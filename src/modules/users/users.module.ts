import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './user.controller';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [],
  providers: [UsersService, UploadService],
  controllers: [UserController],
  exports: [UsersService],
})
export class UsersModule {}
