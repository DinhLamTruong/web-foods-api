import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/product.entity';
import { Order } from '../order/order.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getTotalProductTypes(): Promise<number> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('COUNT(product.id)', 'count')
      .getRawOne();
    return parseInt(result.count, 10) || 0;
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'sum')
      .getRawOne();
    return parseFloat(result.sum) || 0;
  }

  async getTotalRevenueToday(): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'sum')
      .where('order.createdAt BETWEEN :start AND :end', { start, end })
      .getRawOne();

    return parseFloat(result.sum) || 0;
  }
}
