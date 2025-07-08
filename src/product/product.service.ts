import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { UploadService } from '../upload/upload.service';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { addDomainToUrl } from '../utils/domain.util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(createProduct: Partial<Product>): Promise<Product> {
    if (createProduct.price !== undefined) {
      createProduct.price = Math.round(Number(createProduct.price));
    }
    const product = this.productRepository.create(createProduct);
    return this.productRepository.save(product);
  }

  async update(id: number, updateProduct: Partial<Product>): Promise<Product> {
    if (updateProduct.price !== undefined) {
      updateProduct.price = Math.round(Number(updateProduct.price));
    }
    const product = await this.findOne(id);
    Object.assign(product, updateProduct);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async uploadProductImage(productId: number, file: Express.Multer.File, host?: string): Promise<Product> {
    const imageUrl = await this.uploadService.uploadImage(file, 'product');
    const product = await this.findOne(productId);
    const domain = host || this.configService.get<string>('app.host') || '';
    product.imageUrl = addDomainToUrl(imageUrl, domain);
    return this.productRepository.save(product);
  }
}
