import { Module } from '@nestjs/common';
import { PublicDiscountController } from './public.controller';
import { DashboardModule } from '../dashboard/dashboard.module';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [DashboardModule, DiscountModule],
  controllers: [PublicDiscountController],
})
export class PublicModule {}
