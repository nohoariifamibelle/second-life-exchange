import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ItemsModule } from '../items/items.module';
import { ExchangesModule } from '../exchanges/exchanges.module';

@Module({
  imports: [ItemsModule, ExchangesModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
