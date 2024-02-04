import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { BidsService } from './bids.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CanBidGuard } from './guards/can-bid.guard';
import { User } from '../../common/decorators';
import { CreateBidDTO } from '../auctions/dtos/create-bid.dto';

@ApiTags('Auctions')
@Controller('auctions')
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bids on an auction' })
  @UseGuards(CanBidGuard)
  @Post(':id/bid')
  async bid(
    @Param('id') auctionId: string,
    @User('userId') bidderId: string,
    @Body() { amount }: CreateBidDTO,
  ) {
    return this.bidsService.create(auctionId, bidderId, amount);
  }
}
