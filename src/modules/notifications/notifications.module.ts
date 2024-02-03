import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NotificationsGateway } from './notifications.gateway';
import { AuctionsModule } from '../auctions/auctions.module';

@Module({
  imports: [forwardRef(() => AuctionsModule), AuthModule],
  providers: [NotificationsGateway],
  exports: [NotificationsGateway],
})
export class NotificationsModule {}
