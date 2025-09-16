import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class BannerService {
  private readonly bannerDir = path.join(process.cwd(), 'uploads', 'banner');
  private readonly voucherDir = path.join(process.cwd(), 'uploads', 'voucher');

  async saveBanner(file: Express.Multer.File): Promise<string> {
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new InternalServerErrorException('Invalid file type');
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new InternalServerErrorException('File too large');
      }
      await fs.mkdir(this.bannerDir, { recursive: true });
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(this.bannerDir, uniqueName);
      await fs.writeFile(filePath, file.buffer);
      return `/uploads/banner/${uniqueName}`;
    } catch (error) {
      throw new InternalServerErrorException('Failed to save banner');
    }
  }

  async saveVouchers(files: Express.Multer.File[]): Promise<string[]> {
    try {
      await fs.mkdir(this.voucherDir, { recursive: true });
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024;
      const urls: string[] = [];
      for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
          throw new InternalServerErrorException('Invalid file type');
        }
        if (file.size > maxSize) {
          throw new InternalServerErrorException('File too large');
        }
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const uniqueName = `${baseName}_${Date.now()}${Math.floor(Math.random()*10000)}${ext}`;
        const filePath = path.join(this.voucherDir, uniqueName);
        await fs.writeFile(filePath, file.buffer);
        urls.push(`/uploads/voucher/${uniqueName}`);
      }
      return urls;
    } catch (error) {
      throw new InternalServerErrorException('Failed to save voucher images');
    }
  }
}
