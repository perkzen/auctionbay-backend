import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AuctionsService } from '../services/auctions.service';
import { User } from '../../../common/decorators';
import { AuctionDTO } from '../dtos/auction.dto';

@ApiTags('Auctions')
@Controller('auctions/me')
export class UserAuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all auctions created by the user' })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    type: AuctionDTO,
    isArray: true,
  })
  @Get()
  async getUserAuctions(@User('userId') userId: string): Promise<AuctionDTO[]> {
    return await this.auctionsService.findByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all auctions where the user has won' })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    type: AuctionDTO,
    isArray: true,
  })
  @Get('won')
  async getUserWonAuctions(
    @User('userId') userId: string,
  ): Promise<AuctionDTO[]> {
    return await this.auctionsService.findWonAuctionsByUserId(userId);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all auctions where the user is currently bidding',
  })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    type: AuctionDTO,
    isArray: true,
  })
  @Get('bidding')
  async getUserBiddingAuctions(
    @User('userId') userId: string,
  ): Promise<AuctionDTO[]> {
    return await this.auctionsService.findBiddingAuctionsByUserId(userId);
  }
}
