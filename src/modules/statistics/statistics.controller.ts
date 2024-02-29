import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { User } from '../../common/decorators';

@ApiTags('Statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get earnings by user' })
  @ApiOkResponse({
    description: 'Earnings retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        earnings: { type: 'number' },
      },
    },
  })
  @Get('me/earnings')
  async getEarningsByUser(@User('userId') userId: string) {
    const earnings = await this.statisticsService.earningsByUser(userId);
    return { earnings };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get posted auctions by user' })
  @ApiOkResponse({
    description: 'Posted auctions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        postedAuctions: { type: 'number' },
      },
    },
  })
  @Get('me/posted-auctions')
  async getPostedAuctionsByUser(@User('userId') userId: string) {
    const postedAuctions =
      await this.statisticsService.postedAuctionsByUser(userId);
    return { postedAuctions };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active bids by user' })
  @ApiOkResponse({
    description: 'Active bids retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        activeBids: { type: 'number' },
      },
    },
  })
  @Get('me/active-bids')
  async getActiveBidsByUser(@User('userId') userId: string) {
    const activeBids = await this.statisticsService.activeBidsByUser(userId);
    return { activeBids };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get currently winning bids by user' })
  @ApiOkResponse({
    description: 'Currently winning bids retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        winningBids: { type: 'number' },
      },
    },
  })
  @Get('me/winning-bids')
  async getCurrentlyWinningBidsByUser(@User('userId') userId: string) {
    const winningBids =
      await this.statisticsService.currentlyWinningBidsByUser(userId);
    return { winningBids };
  }
}
