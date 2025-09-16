import { Controller, Post, Delete, Param, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

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
}
