import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import settings from './app.settings';
import { ExceptionFilter } from './common/filters/exception.filter';
import { HttpAdapterHost } from '@nestjs/core';

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

  return app;
};

export const bootstrapGlobalPipe = (app: INestApplication) => {
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  return app;
};

export const bootstrapGlobalFilters = (app: INestApplication) => {
  const adapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionFilter(adapterHost));
  return app;
};

export const bootstrapMiddlewares = (app: INestApplication) => {
  app.use(compression());
  app.use(helmet());
  app.enableCors({ origin: settings.app.corsOrigin });
  return app;
};
