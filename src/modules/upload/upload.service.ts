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

  private getFileUrl(name: string) {
    return `https://${settings.aws.s3.bucket}.s3.${settings.aws.s3.region}.amazonaws.com/${name}`;
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

  async delete(url: string) {
    const name = this.extractFileName(url);

    try {
      await this.s3.deleteObject({
        Bucket: settings.aws.s3.bucket,
        Key: name,
      });
    } catch (e) {
      this.logger.error(e);
    }
  }
}
