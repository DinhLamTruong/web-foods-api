import { Controller, Get, UseGuards, Request } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { RoleGuard } from 'src/auth/role.guard'
import { SetMetadata } from '@nestjs/common'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetMetadata('roles', ['admin'])
  @Get()
  getDashboard(@Request() req) {
    return { message: `Welcome to the admin dashboard, user ${req.user.userId}` }
  }

  @Get('product-count')
  async getTotalProductTypes() {
    const count = await this.dashboardService.getTotalProductTypes()
    return { totalProductTypes: count }
  }

  @Get('total-revenue')
  async getTotalRevenue() {
    const totalRevenue = await this.dashboardService.getTotalRevenue()
    return { totalRevenue }
  }

  @Get('total-revenue-today')
  async getTotalRevenueToday() {
    const totalRevenueToday = await this.dashboardService.getTotalRevenueToday()
    return { totalRevenueToday }
  }
}
