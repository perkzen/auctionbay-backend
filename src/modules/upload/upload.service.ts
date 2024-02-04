import { Injectable, Logger } from '@nestjs/common';
import { S3 } from '@aws-sdk/client-s3';
import settings from '../../app.settings';

@Injectable()
export class UploadService {
  private readonly s3 = new S3({
    region: settings.aws.s3.region,
    credentials: {
      accessKeyId: settings.aws.accessKeyId,
      secretAccessKey: settings.aws.secretAccessKey,
    },
  });

  private readonly logger = new Logger(UploadService.name);

  getFileUrl(name: string) {
    return `https://${settings.aws.s3.bucket}.s3.${settings.aws.s3.region}.amazonaws.com/${name}`;
  }

  generateFileName(name: string) {
    return `${name}-${Date.now()}`;
  }

  async upload(file: Express.Multer.File): Promise<string | null> {
    const fileName = this.generateFileName(file.originalname);

    try {
      await this.s3.putObject({
        Bucket: settings.aws.s3.bucket,
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
}
