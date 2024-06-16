import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AuctionsService } from '../services/auctions.service';
import { User } from '@app/common/decorators';
import { AuctionDTO } from '../dtos/auction.dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';
import { AuctionListDTO } from '@app/modules/auctions/dtos/auction-list.dto';
import { UsersAuctionListDTO } from '@app/modules/auctions/dtos/users-auction-list';

@ApiTags('Auctions')
@Controller('auctions/me')
export class UserAuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all auctions created by the user' })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    type: UsersAuctionListDTO,
    isArray: true,
  })
  @Get()
  async getUserAuctions(@User('userId') userId: string) {
    const list = await this.auctionsService.findByUserId(userId);
    return serializeToDto(UsersAuctionListDTO, list);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all auctions where the user has won' })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    type: AuctionDTO,
    isArray: true,
  })
  @Get('won')
  async getUserWonAuctions(@User('userId') userId: string) {
    const list = await this.auctionsService.findWonAuctionsByUserId(userId);
    return serializeToDto(AuctionDTO, list);
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
  async getUserBiddingAuctions(@User('userId') userId: string) {
    const list = await this.auctionsService.findBiddingAuctionsByUserId(userId);
    return serializeToDto(AuctionListDTO, list);
  }
}
