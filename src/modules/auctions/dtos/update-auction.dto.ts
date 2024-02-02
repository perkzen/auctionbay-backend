import { CreateAuctionDTO } from './create-auction.dto';
import { PickType } from '@nestjs/mapped-types';

export class UpdateAuctionDTO extends PickType(CreateAuctionDTO, [
  'startingPrice',
] as const) {}
