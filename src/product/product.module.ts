// import {Module} from '@nestjs/common'
// import {TypeOrmModule} from '@nestjs/typeorm'
// import {Product} from './product.entity'
// import {ProductService} from './product.service'

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './product.entity'
import { ProductService } from './product.service'
import { UploadModule } from '../upload/upload.module'
import { ProductDiscount } from '../discount/product-discount.entity'
import { DiscountCode } from '../discount/discount.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductDiscount, DiscountCode]), UploadModule],
  providers: [ProductService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
