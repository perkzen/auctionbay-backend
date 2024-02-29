import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { User } from '../../common/decorators';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings by user' })
  @Get('me/earnings')
  async getEarningsByUser(@User('userId') userId: string) {
    const earnings = await this.statisticsService.earningsByUser(userId);
    return { earnings };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get posted auctions by user' })
  @Get('me/posted-auctions')
  async getPostedAuctionsByUser(@User('userId') userId: string) {
    const postedAuctions =
      await this.statisticsService.postedAuctionsByUser(userId);
    return { postedAuctions };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active bids by user' })
  @Get('me/active-bids')
  async getActiveBidsByUser(@User('userId') userId: string) {
    const activeBids = await this.statisticsService.activeBidsByUser(userId);
    return { activeBids };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently winning bids by user' })
  @Get('me/winning-bids')
  async getCurrentlyWinningBidsByUser(@User('userId') userId: string) {
    const currentlyWinningBids =
      await this.statisticsService.currentlyWinningBidsByUser(userId);
    return { currentlyWinningBids };
  }
}
