import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { loadEnv } from '@app/config/environment-variables/dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { MiddlewareSetup } from '@app/config/setups/middleware.setup';
import { SwaggerSetup } from '@app/config/setups/swagger.setup';

loadEnv();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  new MiddlewareSetup(app).init();
  new SwaggerSetup(app).init();

  const PORT = configService.get('PORT');
  const SWAGGER_PATH = configService.get('SWAGGER_PATH');

  await app.listen(PORT);
  Logger.log(
    `Documentation is available at http://localhost:${PORT}/${SWAGGER_PATH}`,
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
