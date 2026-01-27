import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { Exchange, ExchangeSchema } from './schemas/exchange.schema';
import { Review, ReviewSchema } from './schemas/review.schema';
import { Item, ItemSchema } from '../items/schemas/item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exchange.name, schema: ExchangeSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
  ],
  providers: [ExchangesService],
  controllers: [ExchangesController],
  exports: [ExchangesService],
})
export class ExchangesModule {}
