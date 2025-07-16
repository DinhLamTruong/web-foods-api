import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DiscountCode } from './discount.entity'
import { ProductDiscount } from './product-discount.entity'
import { DiscountService } from './discount.service'
import { DiscountController, DiscountPublicController } from './discount.controller'
import { ProductModule } from '../product/product.module'

@Module({
  imports: [TypeOrmModule.forFeature([DiscountCode, ProductDiscount]), ProductModule],
  providers: [DiscountService],
  controllers: [DiscountController, DiscountPublicController],
  exports: [DiscountService],
})
export class DiscountModule {}
