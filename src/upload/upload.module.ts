
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  providers: [UploadService, BannerService],
  controllers: [BannerController],
  exports: [UploadService, BannerService],
})
export class UploadModule {}
