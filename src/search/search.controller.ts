import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { Product } from '../product/product.entity';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  async searchProducts(@Query() query: any): Promise<Product[]> {
    return this.searchService.searchProducts(query);
  }
}
