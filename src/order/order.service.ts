import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './order.entity';
import { Product } from '../product/product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(data: Partial<Order>): Promise<Order> {
    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      let totalPrice = 0;

      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          if (!item.productId) {
            throw new Error('ProductId is missing in one of the order items');
          }
          // Use pessimistic locking to lock the product row for update
          const product = await transactionalEntityManager.findOne(Product, {
            where: { id: item.productId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!product) {
            throw new Error(`Product with id ${item.productId} not found`);
          }
          if (product.quantity < item.quantity) {
            throw new Error(`Insufficient quantity for product id ${item.productId}`);
          }
          // Reduce product quantity by ordered quantity
          product.quantity -= item.quantity;
          await transactionalEntityManager.save(product);

          item.price = product.price;
          totalPrice += Number(product.price) * item.quantity;
        }
      }

      // Add shipping fee based on shippingMethod
      if (data.shippingMethod === 'delivery') {
        totalPrice += 40000;
      } else {
        totalPrice += 0;
      }

      data.totalPrice = totalPrice;

      // Create order entity without items first
      const order = this.orderRepository.create({
        ...data,
        items: [],
      });
      const savedOrder = await transactionalEntityManager.save(order);

      // Link each item to the saved order and create OrderItem instances
      if (data.items && data.items.length > 0) {
        const orderItems: OrderItem[] = [];
        for (const item of data.items) {
          const orderItem = this.orderItemRepository.create({
            ...item,
            order: savedOrder,
          });
          orderItems.push(orderItem);
        }
        savedOrder.items = await transactionalEntityManager.save(orderItems);
      }

      return savedOrder;
    });
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | null> {
    await this.orderRepository.update(id, data);
    return this.orderRepository.findOneBy({ id });
  }

  async getOrders(): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndMapOne(
        'order.user',
        'users',
        'user',
        'user.email = order.email'
      )
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndMapOne(
        'order.user',
        'users',
        'user',
        'user.email = order.email'
      )
      .where('order.status = :status', { status })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    await this.orderRepository.update(id, { status });
    return this.orderRepository.findOneBy({ id });
  }

  async updatePaymentStatus(id: number, paymentStatus: string): Promise<Order | null> {
    await this.orderRepository.update(id, { paymentStatus });
    return this.orderRepository.findOneBy({ id });
  }

  async getLatestOrderByEmail(email: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items'], // assuming 'items' is the relation name for order products
    });
  }
}
