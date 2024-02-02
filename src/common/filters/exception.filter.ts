import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class ExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
    }

    let errorMessage = 'Internal server error';

    if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    const response = {
      statusCode: httpStatus,
      message: errorMessage,
      method: ctx.getRequest().method,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    Logger.error(
      `${ctx.getRequest().method} ${ctx.getRequest().url} (Status:${httpStatus} Message:${errorMessage})`,
      '',
      'ExceptionFilter',
    );

    httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }
}
