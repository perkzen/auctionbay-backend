import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import settings from './app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(settings.app.port);
}

(async (): Promise<void> => {
  try {
    await bootstrap();
  } catch (e) {
    Logger.error(e, 'Error');
  }
})();
