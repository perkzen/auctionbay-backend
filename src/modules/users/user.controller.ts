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
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { sanitizeUser } from '../auth/utils/auth.utils';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { User } from '@app/common/decorators';
import { UpdateProfileDTO } from './dtos/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedImage } from '@app/common/decorators/uploaded-image.decorator';
import { UserDTO } from './dtos/user.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: UserDTO,
  })
  @Get('me')
  async me(@User('userId') userId: string) {
    return sanitizeUser(await this.usersService.findById(userId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        firstname: { type: 'string' },
        lastname: { type: 'string' },
      },
    },
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
  @ApiOkResponse({
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
