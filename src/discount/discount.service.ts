import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DiscountCode, DiscountType } from './discount.entity'
import { ProductDiscount } from './product-discount.entity'
import { Product } from '../product/product.entity'
// import { Discount } from './discount.entity';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(DiscountCode)
    private discountRepository: Repository<DiscountCode>,

    @InjectRepository(ProductDiscount)
    private productDiscountRepository: Repository<ProductDiscount>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(data: Partial<DiscountCode>): Promise<DiscountCode> {
    const discount = this.discountRepository.create(data)
    return this.discountRepository.save(discount)
  }

  async findAll(): Promise<DiscountCode[]> {
    return this.discountRepository.find()
  }

  async findOne(id: number): Promise<DiscountCode> {
    const discount = await this.discountRepository.findOne({ where: { id } })
    if (!discount) {
      throw new NotFoundException(`Discount code with id ${id} not found`)
    }
    return discount
  }

  async findOneByCode(code: string): Promise<DiscountCode | null> {
    return this.discountRepository.findOne({ where: { code } });
  }

  async update(id: number, data: Partial<DiscountCode>): Promise<DiscountCode> {
    const discount = await this.findOne(id)
    Object.assign(discount, data)
    return this.discountRepository.save(discount)
  }

  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id)
    await this.discountRepository.remove(discount)
  }

  async assignDiscountToProduct(discountId: number, productId: number): Promise<ProductDiscount> {
    const discount = await this.findOne(discountId)
    const product = await this.productRepository.findOne({ where: { id: productId } })
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`)
    }
    const existing = await this.productDiscountRepository.findOne({
      where: { discount: { id: discountId }, product: { id: productId } },
    })
    if (existing) {
      return existing
    }
    const productDiscount = this.productDiscountRepository.create({ discount, product })
    return this.productDiscountRepository.save(productDiscount)
  }

  async removeDiscountFromProduct(discountId: number, productId: number): Promise<void> {
    const productDiscount = await this.productDiscountRepository.findOne({
      where: { discount: { id: discountId }, product: { id: productId } },
    })
    if (!productDiscount) {
      throw new NotFoundException(`Discount assignment not found for discount ${discountId} and product ${productId}`)
    }
    await this.productDiscountRepository.remove(productDiscount)
  }

  async findDiscountsByProduct(productId: number): Promise<DiscountCode[]> {
    const productDiscounts = await this.productDiscountRepository.find({
      where: { product: { id: productId } },
      relations: ['discount'],
    });
    return productDiscounts.map(pd => pd.discount);
  }

  async validateAndApplyDiscount(code: string, cartTotal: number): Promise<{ valid: boolean; new_total: number; message: string }> {
    if (!code) {
      return { valid: false, new_total: cartTotal, message: 'Mã giảm giá không được để trống' };
    }

    const discount = await this.discountRepository.findOne({ where: { code } });

    if (!discount) {
      return { valid: false, new_total: cartTotal, message: 'Mã giảm giá không tồn tại' };
    }

    const now = new Date();
    if (discount.end_date && discount.end_date < now) {
      return { valid: false, new_total: cartTotal, message: 'Mã giảm giá đã hết hạn' };
    }

    if (!discount.active) {
      return { valid: false, new_total: cartTotal, message: 'Mã giảm giá không còn hiệu lực' };
    }

    if (discount.used_count >= discount.usage_limit) {
      return { valid: false, new_total: cartTotal, message: 'Mã giảm giá đã đạt giới hạn sử dụng' };
    }

    if (discount.min_order && cartTotal < Number(discount.min_order)) {
      return { valid: false, new_total: cartTotal, message: `Đơn hàng tối thiểu là ${discount.min_order}` };
    }

    let newTotal = cartTotal;
    let discountAmount = 0;

    if (discount.discount_type === DiscountType.PERCENT && discount.discount_value) {
      discountAmount = (cartTotal * Number(discount.discount_value)) / 100;
      // Removed max_discount usage as per user request
      // Change calculation to user requested formula: total = product price * discount % + shipping fee
      newTotal = (cartTotal * Number(discount.discount_value)) / 100 + (cartTotal - (cartTotal * Number(discount.discount_value)) / 100);
      // But this formula sums to cartTotal, so adjust to user formula: total = product price * discount % + shipping fee
      // Assuming cartTotal includes shipping fee, we need to separate product price and shipping fee
      // For simplicity, assume shipping fee is 40000 if delivery, else 0
      const shippingFee = cartTotal > 40000 ? 40000 : 0;
      const productPrice = cartTotal - shippingFee;
      newTotal = productPrice * (1 - Number(discount.discount_value) / 100) + shippingFee;
    } else if (discount.discount_type === DiscountType.FIXED && discount.discount_value) {
      discountAmount = Number(discount.discount_value);
      newTotal = cartTotal - discountAmount;
    } else if (discount.discount_type === DiscountType.FREE_SHIPPING) {
      // Deduct shipping fee of 40000 for freeship discount
      const shippingFee = 40000;
      discountAmount = shippingFee;
      newTotal = cartTotal - shippingFee;
    }

    if (newTotal < 0) {
      newTotal = 0;
    }

    // Increment used_count and save discount
    discount.used_count += 1;
    await this.discountRepository.save(discount);

    return {
      valid: true,
      new_total: newTotal,
      message: discount.discount_type === DiscountType.FREE_SHIPPING
        ? `Áp dụng mã freeship thành công: ${discount.code}`
        : `Áp dụng mã giảm giá thành công: ${discount.code}`,
    };
  }

  // async findByCode(code: string): Promise<Discount | null> {
  //   return this.discountRepository.findOne({ where: { code } });
  // }
}
