import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BannerService } from './banner.service';

@Controller('upload')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post('banner')
  @UseInterceptors(FileInterceptor('image'))
  async uploadBanner(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No banner image uploaded');
    }
    const url = await this.bannerService.saveBanner(file);
    return { url };
  }

  @Post('voucher')
  @UseInterceptors(FilesInterceptor('images', 3))
  async uploadVoucher(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length !== 3) {
      throw new BadRequestException('Please upload exactly 3 voucher images');
    }
    const urls = await this.bannerService.saveVouchers(files);
    return { urls };
  }

  @Get('banner')
  async getBannerImages() {
    const urls = await this.bannerService.listBannerImages();
    return { urls };
  }

  @Get('voucher')
  async getVoucherImages() {
    const urls = await this.bannerService.listVoucherImages();
    return { urls };
  }
}
