import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  healthCheck() {
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 60 / 60);
    const uptimeMinutes = Math.floor((uptime / 60) % 60);
    const uptimeSeconds = Math.floor(uptime % 60);
    const uptimeString = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

    const timestamp = new Date().toUTCString();

    return {
      status: 'ok',
      uptime: uptimeString,
      timestamp: timestamp,
      environment: this.configService.get('NODE_ENV'),
    };
  }
}
