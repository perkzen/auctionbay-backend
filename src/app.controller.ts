import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Application Health Check' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  getHealthCheck() {
    return this.appService.healthCheck();
  }
}
