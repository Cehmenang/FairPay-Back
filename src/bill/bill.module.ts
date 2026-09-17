import { Module } from '@nestjs/common';
import { BillService } from './service/bill/bill.service';
import { BillController } from './controller/bill/bill.controller';
import { JwtStrategy } from 'src/user/strategy/jwt.strategy';

@Module({
  providers: [BillService, JwtStrategy],
  controllers: [BillController]
})
export class BillModule {}
