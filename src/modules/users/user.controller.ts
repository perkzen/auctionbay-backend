import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { sanitizeUser } from '../auth/utils/auth.utils';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { User } from '../../common/decorators';
import { UpdateProfileDTO } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedImage } from '../../common/decorators/uploaded-image.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @Get('me')
  async me(@User('userId') userId: string) {
    return sanitizeUser(await this.usersService.findById(userId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile updated successfully',
  })
  @Put('me')
  async updateProfile(
    @Body() data: UpdateProfileDTO,
    @User('userId') userId: string,
  ) {
    return this.usersService.updateProfile(data, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password updated successfully',
  })
  @Put('me/update-password')
  async changePassword(
    @Body() data: UpdatePasswordDTO,
    @User('userId') userId: string,
  ) {
    return this.usersService.updatePassword(data, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile picture' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile picture updated successfully',
  })
  @UseInterceptors(FileInterceptor('image'))
  @Put('me/update-profile-picture')
  async updateProfilePicture(
    @UploadedImage() image: Express.Multer.File,
    @User('userId') userId: string,
  ) {
    return this.usersService.updateProfilePicture(image, userId);
  }
}
