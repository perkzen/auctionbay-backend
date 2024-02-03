import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuctionsService } from './auctions.service';
import { CreateAuctionDTO } from './dtos/create-auction.dto';
import { Public, User } from '../../common/decorators';
import { AuctionOwnerGuard } from './guard/auction-owner.guard';
import { BidGuard } from './guard/bid.guard';
import { CreateBidDTO } from './dtos/create-bid.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedImage } from '../../common/decorators/uploaded-image.decorator';

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
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        startingPrice: { type: 'number' },
        endsAt: { type: 'string', format: 'date-time' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() data: CreateAuctionDTO,
    @User('userId') userId: string,
    @UploadedImage() image: Express.Multer.File,
  ) {
    return this.auctionsService.create(data, userId, image);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates an auction' })
  @UseGuards(AuctionOwnerGuard)
  @Put(':id')
  async update(@Body() data: CreateAuctionDTO, @Param('id') auctionId: string) {
    return this.auctionsService.update(data, auctionId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bids on an auction' })
  @UseGuards(BidGuard)
  @Post(':id/bid')
  async bid(
    @Param('id') auctionId: string,
    @User('userId') bidderId: string,
    @Body() { amount }: CreateBidDTO,
  ) {
    return this.auctionsService.bid(auctionId, bidderId, amount);
  }
}
