import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { DiscountService } from '../discount/discount.service';

@Controller('discounts')
export class PublicDiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get('product/:productId')
  async getDiscountsByProduct(@Param('productId', ParseIntPipe) productId: number) {
    // Implement method in DiscountService to get discounts by product
    return this.discountService.findDiscountsByProduct(productId);
  }
}
