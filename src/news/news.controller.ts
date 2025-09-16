import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewsService } from './news.service';
import { News } from './news.entity';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';
import { addDomainToUrl, getHostUrl } from '../utils/domain.util';

@Controller('news')
export class NewsController {
  private readonly host: string;

  constructor(
    private readonly newsService: NewsService,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {
    this.host = getHostUrl(this.configService) || 'http://localhost:3000';
  }

  @Get()
  async findAll(): Promise<News[]> {
    return this.newsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<News> {
    const news = await this.newsService.findOne(id);
    if (!news) {
      throw new NotFoundException('News not found');
    }
    return news;
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @UploadedFile() image: Express.Multer.File,
    @Body() newsData: Partial<News>,
  ): Promise<News> {
    if (image) {
      const imagePath = await this.uploadService.uploadImage(image, 'news');
      newsData.image = await addDomainToUrl(imagePath, this.host);
    }
    return this.newsService.create(newsData);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @UploadedFile() image: Express.Multer.File,
    @Body() newsData: Partial<News>,
  ): Promise<News> {
    if (image) {
      const imagePath = await this.uploadService.uploadImage(image, 'news');
      newsData.image = await addDomainToUrl(imagePath, this.host);
    }
    const updated = await this.newsService.update(id, newsData);
    if (!updated) {
      throw new NotFoundException('News not found');
    }
    return updated;
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.newsService.remove(id);
  }
}
