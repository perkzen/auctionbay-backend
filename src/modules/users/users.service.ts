import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDTO } from '../auth/dtos/signup.dto';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { comparePasswords, hashPassword } from '../auth/utils/auth.utils';
import { UpdateProfileDTO } from './dtos/update-profile.dto';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly db: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findByEmail(email: string) {
    return this.db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    const user = await this.db.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(user: SignupDTO) {
    return this.db.user.create({
      data: {
        ...user,
        password: await hashPassword(user.password),
      },
    });
  }

  async updateProfile(data: UpdateProfileDTO, userId: string) {
    return this.db.user.update({
      where: { id: userId },
      data,
      select: {
        email: true,
        firstname: true,
        lastname: true,
      },
    });
  }

  async updatePassword(data: UpdatePasswordDTO, userId: string) {
    const user = await this.findById(userId);

    const isCorrectPassword = await comparePasswords(
      data.oldPassword,
      user.password,
    );

    if (!isCorrectPassword) {
      throw new UnauthorizedException("Password doesn't match");
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async updateProfilePicture(image: Express.Multer.File, userId: string) {
    const user = await this.findById(userId);

    if (user.imageUrl) {
      await this.uploadService.delete(user.imageUrl);
    }

    const uploadedImage = await this.uploadService.upload(image);

    if (!uploadedImage) {
      throw new BadRequestException('Failed to upload image');
    }

    return this.db.user.update({
      where: { id: userId },
      data: { imageUrl: uploadedImage },
      select: {
        imageUrl: true,
      },
    });
  }
}
