import {
  Controller,
  Post,
  Delete,
  Param,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import { BannerService } from './banner.service'

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly bannerService: BannerService
  ) {}

  @Post('about')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAboutImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }
    const url = await this.uploadService.saveFile(file)
    return { url }
  }

  @Get('banner')
  async getBannerImages() {
    const urls = await this.bannerService.listBannerImages()
    return { urls }
  }


  async uploadBannerImages(files) {
    console.log('POST /banner received', files ? files.length : 0, 'files')
    if (!files || files.length === 0) {
      console.log('No files, throwing BadRequest')
      throw new BadRequestException('No files uploaded')
    }
    console.log('Calling saveBanners')
    const urls = await this.bannerService.saveBanners(files)
    console.log('saveBanners returned urls:', urls)
    return { urls }
  }

  @Post('banner')
  @UseInterceptors(FileInterceptor('image'))
  async uploadBannerImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded')
    }
    const url = await this.bannerService.saveBanner(file)
    return { url }
  }
}
