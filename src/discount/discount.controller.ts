
import { Controller, Post, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common'
import { DiscountService } from './discount.service'
import { DiscountCode, DiscountType } from './discount.entity'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { RoleGuard } from 'src/auth/role.guard'
import { SetMetadata } from '@nestjs/common'

@Controller('admin/discounts')
// @UseGuards(JwtAuthGuard, RoleGuard)
// @SetMetadata('roles', ['admin'])
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  async create(@Body() data: Partial<DiscountCode>): Promise<DiscountCode> {
    return this.discountService.create(data)
  }

  @Get()
  async findAll(): Promise<DiscountCode[]> {
    return this.discountService.findAll()
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<DiscountCode>
  ): Promise<DiscountCode> {
    return this.discountService.update(id, data)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.discountService.remove(id)
    return { message: 'Discount code deleted successfully' }
  }

  @Post(':id/products/:productId')
  async assignDiscountToProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    return this.discountService.assignDiscountToProduct(id, productId)
  }

  @Delete(':id/products/:productId')
  async removeDiscountFromProduct(
    @Param('id', ParseIntPipe) id: number,
    @Param('productId', ParseIntPipe) productId: number
  ) {
    await this.discountService.removeDiscountFromProduct(id, productId)
    return { message: 'Discount removed from product successfully' }
  }
}

@Controller('discounts')
export class DiscountPublicController {
  constructor(private readonly discountService: DiscountService) {}

  @Post('apply')
  async applyDiscount(@Body() body: { code: string; cart_total: number; shippingMethod?: string }) {
    const { code, cart_total, shippingMethod } = body;
    const shippingFee = shippingMethod === 'delivery' ? 40000 : 0;
    const result = await this.discountService.validateAndApplyDiscount(code, cart_total);
    if (result.valid) {
      result.new_total += shippingFee;
    }
    return result;
  }

  @Post('apply-multiple')
  async applyMultipleDiscounts(@Body() body: { codes: string[]; cart_total: number; shippingMethod?: string }) {
    const { codes, cart_total, shippingMethod } = body;
    console.log('Applying multiple discounts:', codes, cart_total, shippingMethod);

    let shippingFee = shippingMethod === 'delivery' ? 40000 : 0;
    const subtotal = cart_total - shippingFee;
    let discountedSubtotal = subtotal;
    let freeShippingApplied = false;

    for (const code of codes) {
      const discount = await this.discountService.findOneByCode(code);
      if (!discount) {
        return {
          valid: false,
          new_total: cart_total,
          message: `Mã giảm giá ${code} không tồn tại`,
        };
      }

      const now = new Date();
      if (discount.end_date && discount.end_date < now) {
        return {
          valid: false,
          new_total: cart_total,
          message: `Mã giảm giá ${code} đã hết hạn`,
        };
      }

      if (!discount.active) {
        return {
          valid: false,
          new_total: cart_total,
          message: `Mã giảm giá ${code} không còn hiệu lực`,
        };
      }

      if (discount.used_count >= discount.usage_limit) {
        return {
          valid: false,
          new_total: cart_total,
          message: `Mã giảm giá ${code} đã đạt giới hạn sử dụng`,
        };
      }

      if (discount.min_order && cart_total < Number(discount.min_order)) {
        return {
          valid: false,
          new_total: cart_total,
          message: `Đơn hàng tối thiểu để áp dụng mã ${code} là ${discount.min_order}`,
        };
      }

      // Increment used_count and save discount
      discount.used_count += 1;
      await this.discountService.update(discount.id, { used_count: discount.used_count });

      if (discount.discount_type === DiscountType.FREE_SHIPPING) {
        freeShippingApplied = true;
      } else if (discount.discount_type === DiscountType.PERCENT && discount.discount_value) {
        discountedSubtotal = discountedSubtotal - (discountedSubtotal * Number(discount.discount_value)) / 100;
      } else if (discount.discount_type === DiscountType.FIXED && discount.discount_value) {
        discountedSubtotal = discountedSubtotal - Number(discount.discount_value);
      }
    }

    if (freeShippingApplied) {
      shippingFee = 0;
    }

    let total = discountedSubtotal + shippingFee;

    if (total < 0) {
      total = 0;
    }
    console.log('Final total after applying discounts:', total);

    return {
      valid: true,
      new_total: total,
      message: `Áp dụng thành công ${codes.length} mã giảm giá`,
    };
  }
}
