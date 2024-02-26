import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';

@Module({
  providers: [StatisticsService],
  exports: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
