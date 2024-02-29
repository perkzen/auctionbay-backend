import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { BidsService } from './services/bids.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../../common/decorators';
import { CreateBidDTO } from './dtos/create-bid.dto';
import { AutoBidService } from './services/auto-bid.service';
import { CreateAutoBidDTO } from './dtos/create-auto-bid.dto';
import { NotAuctionOwnerGuard } from './guards/not-auction-owner.guard';
import { BidDTO } from './dtos/bid.dto';
import { AutoBidDTO } from './dtos/auto-bid.dto';

@ApiTags('Auctions')
@Controller('auctions')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    private readonly autoBidService: AutoBidService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bid on an auction' })
  @ApiOkResponse({ description: 'Bid created successfully', type: AutoBidDTO })
  @UseGuards(NotAuctionOwnerGuard)
  @Post(':id/bid')
  async bid(
    @Param('id') auctionId: string,
    @User('userId') bidderId: string,
    @Body() { amount }: CreateBidDTO,
  ): Promise<BidDTO> {
    return this.bidsService.create(auctionId, bidderId, amount);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a Auto-bid on an auction' })
  @ApiOkResponse({ description: 'Auto-bid created successfully', type: BidDTO })
  @UseGuards(NotAuctionOwnerGuard)
  @Post(':id/auto-bid')
  async autoBid(
    @Param('id') auctionId: string,
    @User('userId') bidderId: string,
    @Body() data: CreateAutoBidDTO,
  ): Promise<AutoBidDTO> {
    return this.autoBidService.create(auctionId, bidderId, data);
  }
}
