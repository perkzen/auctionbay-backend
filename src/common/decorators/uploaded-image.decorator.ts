import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UploadedFileValidationPipe } from '../pipes/uploaded-file.pipe';

export const UploadedImage = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file = request.file;

    if (file) {
      new UploadedFileValidationPipe().transform(file, null);
      return file;
    }

    return null;
  },
);
