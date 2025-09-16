import { Controller, Post, Delete, Param, UploadedFile, UploadedFiles, UseInterceptors, BadRequestException, Get } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { BannerService } from './banner.service';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly bannerService: BannerService,
  ) {}

  @Post('about')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAboutImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = await this.uploadService.saveFile(file);
    return { url };
  }

  @Delete('about/:imageName')
  async deleteAboutImage(@Param('imageName') imageName: string) {
    await this.uploadService.deleteFile(imageName);
    return { message: 'Image deleted successfully' };
  }

  @Get('banner')
  async getBannerImages() {
    const urls = await this.bannerService.listBannerImages();
    return { urls };
  }

  @Post('banner')
  @UseInterceptors(FileInterceptor('image'))
  async uploadBannerImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const url = await this.bannerService.saveBanner(file);
    return { url };
  }

  @Get('voucher')
  async getVoucherImages() {
    const urls = await this.bannerService.listVoucherImages();
    return { urls };
  }

  @Post('voucher')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadVoucherImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const urls = await this.bannerService.saveVouchers(files);
    return { urls };
  }

  @Get('featured')
  async getFeaturedImages() {
    const urls = await this.bannerService.listFeaturedImages();
    return { urls };
  }

  @Post('featured')
  @UseInterceptors(FilesInterceptor('images'))
  async uploadFeaturedImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const urls = await this.bannerService.saveFeatured(files);
    return { urls };
  }
}
