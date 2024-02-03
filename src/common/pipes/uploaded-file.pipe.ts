import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { MAX_FILE_SIZE } from '../constants/app.constants'; // Create this validator

@Injectable()
export class UploadedFileValidationPipe implements PipeTransform {
  transform(value: Express.Multer.File, _metadata: ArgumentMetadata) {
    if (!value) {
      return null;
    }

    const validators = [
      new MaxFileSizeValidator({
        maxSize: MAX_FILE_SIZE,
        message: 'Maximum file size is 2MB.',
      }),
      new FileTypeValidator({
        fileType: '.(png|jpeg|jpg)',
      }),
    ];

    for (const validator of validators) {
      const isValid = validator.isValid(value);
      if (!isValid) {
        throw new BadRequestException(validator.buildErrorMessage());
      }
    }

    return value;
  }
}
