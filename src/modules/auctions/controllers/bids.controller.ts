import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { BidsService } from '../services/bids.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../../../common/decorators';
import { CreateBidDTO } from '../dtos/create-bid.dto';
import { AutoBidService } from '../services/auto-bid.service';
import { CreateAutoBidDTO } from '../dtos/create-auto-bid.dto';
import { NotAuctionOwnerGuard } from '../guard/not-auction-owner.guard';

@ApiTags('Auctions')
@Controller('auctions')
export class BidsController {
  constructor(
    private readonly bidsService: BidsService,
    private readonly autoBidService: AutoBidService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bids on an auction' })
  @UseGuards(NotAuctionOwnerGuard)
  @Post(':id/bid')
  async bid(
    @Param('id') auctionId: string,
    @User('userId') bidderId: string,
    @Body() { amount }: CreateBidDTO,
  ) {
    return this.bidsService.create(auctionId, bidderId, amount);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Auto-bids on an auction' })
  @UseGuards(NotAuctionOwnerGuard)
  @Post(':id/auto-bid')
  async autoBid(
    @Param('id') auctionId: string,
    @User('userId') bidderId: string,
    @Body() data: CreateAutoBidDTO,
  ) {
    return this.autoBidService.create(auctionId, bidderId, data);
  }
}
