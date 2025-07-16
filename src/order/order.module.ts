import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order, OrderItem } from './order.entity';
import { Product } from '../product/product.entity';
import { DiscountModule } from '../discount/discount.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product]), DiscountModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
