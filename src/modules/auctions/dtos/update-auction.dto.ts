import { CreateAuctionDTO } from './create-auction.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAuctionDTO extends PartialType(CreateAuctionDTO) {}
