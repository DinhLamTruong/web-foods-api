import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from './order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() data: any): Promise<Order> {
    console.log('Received order data:', JSON.stringify(data, null, 2));
    const { customerInfo, items } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Order items are required');
    }

    // Map each item's 'id' to 'productId'
    const mappedItems = items.map((item, index) => {
      if (!item.id) {
        throw new BadRequestException(`Product id is missing in order item at index ${index}`);
      }
      return {
        ...item,
        productId: item.id,
      };
    });

    // Validate productId presence
    for (const [index, item] of mappedItems.entries()) {
      if (!item.productId) {
        throw new BadRequestException(`ProductId is missing in order item at index ${index}`);
      }
    }

    // Ensure district, province, ward are strings (extract label if object)
    const district = typeof customerInfo.district === 'object' && customerInfo.district !== null
      ? (customerInfo.district as { label: string }).label
      : customerInfo.district;

    const province = typeof customerInfo.province === 'object' && customerInfo.province !== null
      ? (customerInfo.province as { label: string }).label
      : customerInfo.province;

    const ward = typeof customerInfo.ward === 'object' && customerInfo.ward !== null
      ? (customerInfo.ward as { label: string }).label
      : customerInfo.ward;

    const shippingMethod = customerInfo.shippingMethod || '';

    // Accept discountCodes as array or comma-separated string
    let discountCodes: string[] = [];
    if (Array.isArray(customerInfo.discountCodes)) {
      discountCodes = customerInfo.discountCodes;
    } else if (typeof customerInfo.discountCodes === 'string' && customerInfo.discountCodes.trim() !== '') {
      discountCodes = customerInfo.discountCodes.split(',').map(code => code.trim());
    } else if (customerInfo.discountCode && customerInfo.discountCode.trim() !== '') {
      discountCodes = [customerInfo.discountCode.trim()];
    }

    const orderData: Partial<Order> = {
      ...customerInfo,
      district,
      province,
      ward,
      shippingMethod,
      discountCode: discountCodes.join(','), // store as comma-separated string
      items: mappedItems,
    };

    try {
      return await this.orderService.createOrder(orderData);
    } catch (error) {
      console.error('Error in createOrder:', error);
      if (error instanceof Error && error.message.includes('Insufficient quantity')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Put(':id')
  async updateOrder(@Param('id') id: string, @Body() data: Partial<Order>): Promise<Order | null> {
    // Ensure district, province, ward are strings (extract label if object)
    if (data.district && typeof data.district === 'object' && data.district !== null) {
      data.district = (data.district as { label: string }).label;
    }
    if (data.province && typeof data.province === 'object' && data.province !== null) {
      data.province = (data.province as { label: string }).label;
    }
    if (data.ward && typeof data.ward === 'object' && data.ward !== null) {
      data.ward = (data.ward as { label: string }).label;
    }
    return this.orderService.updateOrder(Number(id), data);
  }

  @Get()
  async getOrders(): Promise<Order[]> {
    return this.orderService.getOrders();
  }

  @Get('user')
  async getOrdersByUserEmail(@Query('email') email: string): Promise<Order[]> {
    return this.orderService.getOrdersByEmail(email);
  }

  @Get('status/:status')
  async getOrdersByStatus(@Param('status') status: string): Promise<Order[]> {
    return this.orderService.getOrdersByStatus(status);
  }

  @Get('latest')
  async getLatestOrder(@Query('email') email: string): Promise<Order | null> {
    return this.orderService.getLatestOrderByEmail(email);
  }

  @Patch(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body('status') status: string): Promise<Order | null> {
    return this.orderService.updateOrderStatus(Number(id), status);
  }

  @Patch(':id/payment-status')
  async updatePaymentStatus(@Param('id') id: string, @Body('paymentStatus') paymentStatus: string): Promise<Order | null> {
    return this.orderService.updatePaymentStatus(Number(id), paymentStatus);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string): Promise<Order | null> {
    return this.orderService.getOrderById(Number(id));
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string): Promise<{ message: string }> {
    const success = await this.orderService.deleteOrder(Number(id));
    if (!success) {
      throw new BadRequestException(`Order with id ${id} not found`);
    }
    return { message: 'Order deleted successfully' };
  }
}
