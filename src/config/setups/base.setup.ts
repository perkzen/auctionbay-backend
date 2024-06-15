import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

export abstract class BaseSetup<SetupConfig = undefined> {
  protected configService: ConfigService;
  protected logger: Logger;

  protected constructor(protected readonly app: NestExpressApplication) {
    this.configService = app.get(ConfigService);
    this.logger = new Logger(this.constructor.name);
  }

  abstract init(setupConfig?: SetupConfig): void | Promise<void>;
}
