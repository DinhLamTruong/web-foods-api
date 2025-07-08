import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from '../product/product.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async searchProducts(query: any): Promise<Product[]> {
    let qb: SelectQueryBuilder<Product> = this.productRepository.createQueryBuilder('product');

    if (query.q) {
      qb = qb.andWhere('product.name LIKE :name', { name: `%${query.q}%` });
    }

    if (query.categoryType) {
      qb = qb.andWhere('product.categoryType = :categoryType', { categoryType: query.categoryType });
    }

    if (query.minPrice) {
      qb = qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice) {
      qb = qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    // Add more filters as needed

    return qb.getMany();
  }
}
