import {BadRequestException, Injectable} from '@nestjs/common'
import {extname, join} from 'path'
import {existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync} from 'fs'
import {v4 as uuidv4} from 'uuid'

@Injectable()
export class UploadService {
  private readonly uploadPath = './uploads'

  constructor() {
    // Create uploading folders if it does not exist
    mkdirSync(this.uploadPath, {recursive: true})
  }

  uploadImage(file: Express.Multer.File, category: 'product' | 'avatar' | 'news'): string {
    // Allow only image file types
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images allowed.')
    }

    const filename = `${uuidv4()}${extname(file.originalname)}`
    const path = join(this.uploadPath, category)
    mkdirSync(path, {recursive: true})
    const filePath = join(path, filename)
    const result = `/uploads/${category}/${filename}`

    writeFileSync(filePath, file.buffer)

    return result
  }

  deleteFileOrFolder(category: 'product' | 'avatar', name?: string, id?: number): void {
    if (!category) {
      throw new BadRequestException('Category is required')
    }

    if (id && !name) {
      // If only `id` is provided, delete the entire folder for the category
      const folderPath = join(this.uploadPath, category)
      if (existsSync(folderPath)) {
        rmSync(folderPath, {recursive: true, force: true})
      }
    } else if (name && id) {
      // If both `name` and `id` are provided, delete a specific file in the category's folder
      const filePath = join(this.uploadPath, category, name)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    } else {
      throw new BadRequestException('Either ID or file name must be provided')
    }
  }
}
