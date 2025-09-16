
import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';

@Module({
  providers: [UploadService, BannerService],
  controllers: [BannerController],
  exports: [UploadService, BannerService],
})
export class UploadModule {}
