import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    return this.db.user.findUnique({
      where: { id },
    });
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
      throw new HttpException(
        "Password doesn't match",
        HttpStatus.UNAUTHORIZED,
      );
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
      throw new HttpException('Failed to upload image', HttpStatus.BAD_REQUEST);
    }

    return this.db.user.update({
      where: { id: userId },
      data: { imageUrl: uploadedImage },
      select: {
        imageUrl: true,
      },
    });
  }

  async profileStats(userId: string) {
    // earnings get last bid on closed auctions
  }
}
