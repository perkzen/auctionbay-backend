import { AuctionListDTO } from '@app/modules/auctions/dtos/auction-list.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class UsersAuctionListDTO extends AuctionListDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  description: string;
}
