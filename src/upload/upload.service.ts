import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'about');

  async saveFile(file: Express.Multer.File): Promise<string> {
    try {
      // Validate file type (only allow images)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw new InternalServerErrorException('Invalid file type');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new InternalServerErrorException('File too large');
      }

      await fs.mkdir(this.uploadDir, { recursive: true });

      // Rename file to avoid duplicate (add timestamp)
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const uniqueName = `${baseName}_${Date.now()}${ext}`;
      const filePath = path.join(this.uploadDir, uniqueName);
      await fs.writeFile(filePath, file.buffer);
      // Return the relative URL path for the uploaded file
      return `/uploads/about/${uniqueName}`;
    } catch (error) {
      throw new InternalServerErrorException('Failed to save file');
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    // For compatibility with existing code, ignoring folder param and calling saveFile
    return this.saveFile(file);
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, fileName);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore error if file does not exist
    }
  }
}
