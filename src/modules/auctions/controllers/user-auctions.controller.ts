import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AuctionsService } from '../services/auctions.service';
import { User } from '../../../common/decorators';

@ApiTags('Auctions')
@Controller('auctions/me')
export class UserAuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all auctions created by the user' })
  @Get()
  async getUserAuctions(@User('userId') userId: string) {
    return await this.auctionsService.findByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all auctions where the user has won' })
  @Get('won')
  async getUserWonAuctions(@User('userId') userId: string) {
    return await this.auctionsService.findWonAuctionsByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all auctions where the user is currently bidding',
  })
  @Get('bidding')
  async getUserBiddingAuctions(@User('userId') userId: string) {
    return await this.auctionsService.findBiddingAuctionsByUserId(userId);
  }
}
