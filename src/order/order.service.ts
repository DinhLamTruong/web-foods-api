import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderItem } from './order.entity';
import { Product } from '../product/product.entity';
import { DiscountService } from '../discount/discount.service';
import { DiscountType } from '../discount/discount.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    private discountService: DiscountService,
  ) {}

  async calculateTotalPrice(
    transactionalEntityManager: any,
    items: any[],
    shippingMethod: string,
    discountCodes?: string[],
  ): Promise<number> {
    let subtotal = 0;

    if (items && items.length > 0) {
      for (const item of items) {
        if (!item.productId) {
          throw new Error('ProductId is missing in one of the order items');
        }
        const product = await transactionalEntityManager.findOne(Product, {
          where: { id: item.productId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!product) {
          throw new Error(`Product with id ${item.productId} not found`);
        }
        subtotal += Number(product.price) * item.quantity;
      }
    }

    let shippingFee = shippingMethod === 'delivery' ? 40000 : 0;

    let discountedSubtotal = subtotal;
    let freeShippingApplied = false;

    if (discountCodes && discountCodes.length > 0) {
      for (const code of discountCodes) {
        const discount = await this.discountService.findOneByCode(code);
        if (!discount) {
          continue;
        }
        if (discount.discount_type === DiscountType.FREE_SHIPPING) {
          freeShippingApplied = true;
        } else if (discount.discount_type === DiscountType.PERCENT && discount.discount_value) {
          // Apply discount on subtotal only
          discountedSubtotal = discountedSubtotal - (subtotal * Number(discount.discount_value)) / 100;
        } else if (discount.discount_type === DiscountType.FIXED && discount.discount_value) {
          discountedSubtotal = discountedSubtotal - Number(discount.discount_value);
        }
      }
    }

    if (freeShippingApplied) {
      shippingFee = 0;
    }

    let total = discountedSubtotal + shippingFee;

    if (total < 0) {
      total = 0;
    }

    return total;
  }

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

      // Parse discount codes from comma-separated string to array
      let discountCodes: string[] = [];
      if (data.discountCode && data.discountCode.trim() !== '') {
        discountCodes = data.discountCode.split(',').map(code => code.trim());
      }

      // Calculate total price using the new method
      totalPrice = await this.calculateTotalPrice(
        transactionalEntityManager,
        data.items ?? [],
        data.shippingMethod || '',
        discountCodes,
      );

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
    return await this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      // Fetch existing order
      const existingOrder = await transactionalEntityManager.findOne(Order, { where: { id }, relations: ['items'] });
      if (!existingOrder) {
        throw new Error(`Order with id ${id} not found`);
      }

      // Merge updated data
      const updatedOrder = { ...existingOrder, ...data };

      // Recalculate totalPrice if discountCode, items, or shippingMethod changed
      const discountCodeChanged = data.discountCode !== undefined && data.discountCode !== existingOrder.discountCode;
      const itemsChanged = data.items !== undefined;
      const shippingMethodChanged = data.shippingMethod !== undefined && data.shippingMethod !== existingOrder.shippingMethod;

      // Parse discount codes from comma-separated string to array
      let discountCodes: string[] = [];
      if (updatedOrder.discountCode && updatedOrder.discountCode.trim() !== '') {
        discountCodes = updatedOrder.discountCode.split(',').map(code => code.trim());
      }

      if (discountCodeChanged || itemsChanged || shippingMethodChanged) {
        const itemsToCalculate = data.items ?? existingOrder.items;
        const totalPrice = await this.calculateTotalPrice(
          transactionalEntityManager,
          itemsToCalculate,
          updatedOrder.shippingMethod || '',
          discountCodes,
        );
        updatedOrder.totalPrice = totalPrice;
      }

      // Update order entity
      await transactionalEntityManager.update(Order, id, updatedOrder);

      // If items updated, update order items
      if (itemsChanged) {
        // Remove existing items
        if (existingOrder.items && existingOrder.items.length > 0) {
          await transactionalEntityManager.remove(existingOrder.items);
        }
        // Add new items
        if (data.items && data.items.length > 0) {
          const orderItems: OrderItem[] = [];
          for (const item of data.items) {
            const orderItem = this.orderItemRepository.create({
              ...item,
              order: updatedOrder,
            });
            orderItems.push(orderItem);
          }
          await transactionalEntityManager.save(orderItems);
        }
      }

      return transactionalEntityManager.findOne(Order, { where: { id }, relations: ['items'] });
    });
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

  async getOrdersByEmail(email: string): Promise<Order[]> {
    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndMapOne(
        'order.user',
        'users',
        'user',
        'user.email = order.email'
      )
      .where('order.email = :email', { email })
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
