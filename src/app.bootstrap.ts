import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import settings from './app.settings';
import { ExceptionFilter } from './common/filters/exception.filter';
import { HttpAdapterHost } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

export const bootstrapSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Actionbay REST API')
    .setDescription(
      'Web application that enables users to create and manage events for auctions.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(settings.app.swaggerPath, app, document);
};

export const bootstrapGlobalPipe = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
};

export const bootstrapGlobalFilters = (app: INestApplication) => {
  const adapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionFilter(adapterHost));
};

export const bootstrapGlobalInterceptors = (app: INestApplication) => {
  app.useGlobalInterceptors(new LoggingInterceptor());
};

export const bootstrapMiddlewares = (app: INestApplication) => {
  app.use(compression());
  app.use(helmet());
  app.enableCors({ origin: settings.app.corsOrigin });
};
