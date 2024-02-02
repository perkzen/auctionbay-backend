import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { Public, User } from '../../common/decorators';
import { AuctionOwner } from './guard/auction-owner.guard';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @ApiOperation({
    summary: 'List all active auctions in descending order by createdAt',
  })
  @Public()
  @Get()
  async list() {
    return this.auctionsService.list();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new auction' })
  @Post()
  async create(@Body() data: CreateAuctionDTO, @User('userId') userId: string) {
    return this.auctionsService.create(data, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates an auction' })
  @UseGuards(AuctionOwner)
  @Put(':id')
  async update(@Body() data: CreateAuctionDTO, @Param('id') auctionId: string) {
    return this.auctionsService.update(data, auctionId);
  }
}
