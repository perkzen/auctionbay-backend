import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

(async (): Promise<void> => {
  try {
    await bootstrap();
  } catch (e) {
    Logger.error(e, 'Error');
  }
})();
