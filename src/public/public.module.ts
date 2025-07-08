import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [DashboardModule],
  controllers: [PublicController],
})
export class PublicModule {}
