import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SecurityLoggerService } from './services/security-logger.service';
import { SecurityLog, SecurityLogSchema } from './schemas/security-log.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SecurityLog.name, schema: SecurityLogSchema },
    ]),
  ],
  providers: [SecurityLoggerService],
  exports: [SecurityLoggerService],
})
export class CommonModule {}
