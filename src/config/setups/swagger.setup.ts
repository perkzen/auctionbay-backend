import { NestExpressApplication } from '@nestjs/platform-express';
import { BaseSetup } from '@app/config/setups/base.setup';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { isProdEnv } from '@app/common/utils/env-check';

export class SwaggerSetup extends BaseSetup {
  constructor(readonly app: NestExpressApplication) {
    super(app);
  }

  init(): void {
    if (isProdEnv()) {
      this.logger.log('Prod environment detected, skipping Swagger docs init');
      return;
    }

    SwaggerModule.setup(
      this.configService.getOrThrow('SWAGGER_PATH'),
      this.app,
      this.createDocument(),
    );
    this.logger.log('Swagger setup completed!');
  }

  private createDocument() {
    const config = new DocumentBuilder()
      .setTitle('Actionbay REST API')
      .setDescription(
        'Web application that enables users to create and manage events for auctions.',
      )
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    return SwaggerModule.createDocument(this.app, config);
  }
}
