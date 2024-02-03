import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements HttpExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage: string | object = 'Internal server error';
    let errorName: string = 'UnknownError';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      errorMessage =
        exception.getResponse()?.['message'] || exception.getResponse();
      errorName = exception.getResponse()?.['error'] || exception.name;
    }

    if (exception instanceof Error && !errorMessage) {
      errorMessage = exception.message;
    }

    const response = {
      statusCode: httpStatus,
      error: errorName,
      message: errorMessage,
      method: ctx.getRequest().method,
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    Logger.error(
      `${ctx.getRequest().method} ${ctx.getRequest().url} (Status:${httpStatus} Error:${JSON.stringify(errorMessage)})`,
      '',
      'HttpExceptionFilter',
    );

    httpAdapter.reply(ctx.getResponse(), response, httpStatus);
  }
}
