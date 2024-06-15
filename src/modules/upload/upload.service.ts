import { Injectable, Logger } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  private readonly s3: S3;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3({
      region: this.configService.get('AWS_S3_REGION'),
      credentials: {
        accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  private getFileUrl(name: string) {
    const bucket = this.configService.get('AWS_S3_BUCKET_NAME');
    const region = this.configService.get('AWS_S3_REGION');

    return `https://${bucket}.s3.${region}.amazonaws.com/${name}`;
  }

  private generateFileName(name: string) {
    return `${name}-${Date.now()}`;
  }

  private extractFileName(url: string) {
    return url.split('/').pop();
  }

  async upload(file: Express.Multer.File): Promise<string | null> {
    const fileName = this.generateFileName(file.originalname);

    try {
      await this.s3.putObject({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      return this.getFileUrl(fileName);
    } catch (e) {
      this.logger.error(e);
    }
    return null;
  }

  async delete(url: string) {
    const name = this.extractFileName(url);

    try {
      await this.s3.deleteObject({
        Bucket: this.configService.get('AWS_S3_BUCKET_NAME'),
        Key: name,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
