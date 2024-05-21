import {
  Body,
  Controller,
  Delete,
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
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuctionsService } from '../services/auctions.service';
import { CreateAuctionDTO } from '../dtos/create-auction.dto';
import { User } from '@app/common/decorators';
import { AuctionOwnerGuard } from '../guards/auction-owner.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadedImage } from '@app/common/decorators/uploaded-image.decorator';
import { AuctionDTO } from '../dtos/auction.dto';
import { AuctionListDTO } from '../dtos/auction-list.dto';
import { UpdateAuctionDTO } from '../dtos/update-auction.dto';
import { serializeToDto } from '@app/common/utils/serialize-to-dto';

@ApiTags('Auctions')
@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all active auctions in descending order by createdAt',
  })
  @ApiOkResponse({
    description: 'Auctions retrieved successfully',
    type: AuctionListDTO,
    isArray: true,
  })
  @Get()
  async list(@User('userId') userId: string) {
    const list = await this.auctionsService.list(userId);
    return serializeToDto(AuctionListDTO, list);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get an auction by id' })
  @ApiOkResponse({
    description: 'Auction retrieved successfully',
    type: AuctionDTO,
  })
  @Get(':id')
  async getById(@Param('id') id: string) {
    const auction = await this.auctionsService.findById(id);
    return serializeToDto(AuctionDTO, auction);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Creates a new auction' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: 'Auction created successfully',
    type: AuctionDTO,
  })
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
    const auction = await this.auctionsService.create(data, userId, image);
    return serializeToDto(AuctionDTO, auction);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Updates an auction' })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: 'Auction updated successfully',
    type: AuctionDTO,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        endsAt: { type: 'string', format: 'date-time' },
        image: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['title', 'description', 'endsAt'],
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(AuctionOwnerGuard)
  @Put(':id')
  async update(
    @Body() data: UpdateAuctionDTO,
    @Param('id') auctionId: string,
    @UploadedImage() image?: Express.Multer.File,
  ) {
    const auction = await this.auctionsService.update(data, auctionId, image);
    return serializeToDto(AuctionDTO, auction);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes an auction' })
  @ApiOkResponse({
    description: 'Auction deleted successfully',
    type: AuctionDTO,
  })
  @UseGuards(AuctionOwnerGuard)
  @Delete(':id')
  async delete(@Param('id') auctionId: string) {
    const auction = await this.auctionsService.delete(auctionId);
    return serializeToDto(AuctionDTO, auction);
  }
}
