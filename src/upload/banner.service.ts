import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common'
import { Express } from 'express'
import * as fs from 'fs/promises'
import * as path from 'path'

@Injectable()
export class BannerService {
  private bannerDir = path.join(process.cwd(), 'uploads', 'banner')
  private featuredDir = path.join(process.cwd(), 'uploads', 'featured')
  private allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  private maxSize = 10 * 1024 * 1024

  private validateFile(file: Express.Multer.File) {
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type: ${file.mimetype}`)
    }
    if (file.size > this.maxSize) {
      throw new BadRequestException(`File too large: ${file.originalname}`)
    }
  }

  async saveBanner(file: Express.Multer.File) {
    try {
      this.validateFile(file)
      await fs.mkdir(this.bannerDir, { recursive: true })

      const ext = path.extname(file.originalname)
      const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`
      const filePath = path.join(this.bannerDir, uniqueName)

      await fs.writeFile(filePath, file.buffer!)
      return `/api/uploads/banner/${uniqueName}`
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save banner: ${error.message}`)
    }
  }

  async saveBanners(files: Express.Multer.File[]) {
    try {
      await fs.mkdir(this.bannerDir, { recursive: true })
      let existingFiles = await fs.readdir(this.bannerDir)
      console.log(`Found ${existingFiles.length} existing banner files to delete.`)
      for (const fileName of existingFiles) {
        const filePath = path.join(this.bannerDir, fileName)
        try {
          await fs.unlink(filePath)
          console.log(`Deleted existing file: ${fileName}`)
        } catch (deleteError) {
          console.error(`Failed to delete ${fileName}:`, deleteError)
          throw new InternalServerErrorException(`Failed to delete old banner: ${fileName}`)
        }
      }
      existingFiles = await fs.readdir(this.bannerDir)
      if (existingFiles.length > 0) {
        console.error('Directory not empty after deletion attempt:', existingFiles)
        throw new InternalServerErrorException('Failed to clear old banners')
      }
      console.log('Banner directory cleared successfully.')
      const urls: string[] = []
      for (const file of files) {
        this.validateFile(file)
        const ext = path.extname(file.originalname)
        const baseName = path.basename(file.originalname, ext)
        const uniqueName = `${baseName}_${Date.now()}${Math.floor(Math.random() * 10000)}${ext}`
        const filePath = path.join(this.bannerDir, uniqueName)
        await fs.writeFile(filePath, file.buffer)
        urls.push(`/api/uploads/banner/${uniqueName}`)
        console.log(`Saved new banner: ${uniqueName}`)
      }
      return urls
    } catch (error) {
      console.error('Error saving banner images:', error)
      throw new InternalServerErrorException('Failed to save banner images')
    }
  }

  async listBannerImages() {
    try {
      await fs.mkdir(this.bannerDir, { recursive: true })
      const files = await fs.readdir(this.bannerDir)
      return files.map((file) => `/api/uploads/banner/${file}`)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to list banner images: ${error.message}`)
    }
  }

  async saveFeatured(files: Express.Multer.File[]) {
    try {
      await fs.mkdir(this.featuredDir, { recursive: true })
      const urls: string[] = []

      for (const file of files) {
        this.validateFile(file)

        const ext = path.extname(file.originalname)
        const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`
        const filePath = path.join(this.featuredDir, uniqueName)

        await fs.writeFile(filePath, file.buffer!)
        urls.push(`/api/uploads/featured/${uniqueName}`)
      }
      return urls
    } catch (error) {
      throw new InternalServerErrorException(`Failed to save featured images: ${error.message}`)
    }
  }

  async listFeaturedImages() {
    try {
      await fs.mkdir(this.featuredDir, { recursive: true })
      const files = await fs.readdir(this.featuredDir)
      return files.map((file) => `/api/uploads/featured/${file}`)
    } catch (error) {
      throw new InternalServerErrorException(`Failed to list featured images: ${error.message}`)
    }
  }
}
