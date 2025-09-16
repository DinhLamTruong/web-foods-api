import {Controller, Get, Post, Put, Delete, Body, UseGuards} from '@nestjs/common'
import {AboutService} from './about.service'
import {JwtAuthGuard} from '../auth/jwt-auth.guard'

@Controller('about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  async getAbout() {
    return this.aboutService.findOne()
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createAbout(@Body('content') content: string) {
    return this.aboutService.create(content)
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateAbout(@Body('content') content: string) {
    return this.aboutService.update(content)
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async removeAbout() {
    return this.aboutService.remove()
  }
}
