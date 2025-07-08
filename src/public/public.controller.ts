import { Controller, Get } from '@nestjs/common';
import { DashboardService } from '../dashboard/dashboard.service';

@Controller('public')
export class PublicController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('product-count')
  async getTotalProductTypes() {
    const count = await this.dashboardService.getTotalProductTypes();
    return { totalProductTypes: count };
  }

  @Get('total-revenue')
  async getTotalRevenue() {
    const totalRevenue = await this.dashboardService.getTotalRevenue();
    return { totalRevenue };
  }
}
