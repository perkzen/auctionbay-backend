import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import settings from './app.settings';
import {
  bootstrapGlobalPipe,
  bootstrapMiddlewares,
  bootstrapSwagger,
} from './app.bootstrap';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  bootstrapSwagger(app);
  bootstrapGlobalPipe(app);
  bootstrapMiddlewares(app);

  await app.listen(settings.app.port);
  Logger.log(
    `Documentation is available at http://localhost:${settings.app.port}/${settings.app.swaggerPath}`,
    'Bootstrap',
  );
}

(async (): Promise<void> => {
  try {
    await bootstrap();
  } catch (e) {
    Logger.error(e, 'Error');
  }
})();
