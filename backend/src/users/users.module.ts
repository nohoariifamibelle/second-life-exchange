import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { ItemsModule } from '../items/items.module';
import { ExchangesModule } from '../exchanges/exchanges.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => ItemsModule),
    forwardRef(() => ExchangesModule),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService], //Exporter pour utilisation dans AuthModule
})
export class UsersModule {}
