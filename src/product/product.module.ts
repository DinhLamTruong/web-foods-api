// import {Module} from '@nestjs/common'
// import {TypeOrmModule} from '@nestjs/typeorm'
// import {Product} from './product.entity'
// import {ProductService} from './product.service'

import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Product } from './product.entity'
import { ProductService } from './product.service'
import { UploadModule } from '../upload/upload.module'

@Module({
  imports: [TypeOrmModule.forFeature([Product]), UploadModule],
  providers: [ProductService],
  exports: [ProductService, TypeOrmModule],
})
export class ProductModule {}
