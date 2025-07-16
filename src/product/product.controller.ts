/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Query,
  Req,
  ParseIntPipe,
  BadRequestException,
  Logger,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ProductService } from './product.service'
import { Express } from 'express'

@Controller('product')
export class ProductController {
  private readonly logger = new Logger(ProductController.name)

  constructor(private readonly productService: ProductService) {}

  @Get()
  async findAll() {
    this.logger.log('GET /product called')
    return this.productService.findAll()
  }

  @Get('with-active-discounts')
  async findAllWithActiveDiscounts() {
    this.logger.log('GET /product/with-active-discounts called')
    return this.productService.findAllWithActiveDiscounts()
  }

  @Post()
  async handlePost(@Query('type') type: string, @Body() body: any, @Query('id') id?: string) {
    let parsedId: number | null = null
    if (id) {
      parsedId = parseInt(id, 10)
      if (isNaN(parsedId)) {
        throw new BadRequestException('Product id must be a number')
      }
    }
    this.logger.log(`POST /product called with type=${type} id=${id}`)
    this.logger.log(`POST /product body: ${JSON.stringify(body)}`)
    try {
      if (type === 'add') {
        // discountIds can be passed in body as array of numbers
        const created = await this.productService.create(body)
        this.logger.log(`Product created with id=${created.id}`)
        return created
      } else if (type === 'edit') {
        if (!parsedId) {
          throw new BadRequestException('Product id must be provided for edit')
        }
        // discountIds can be passed in body as array of numbers
        const updated = await this.productService.update(parsedId, body)
        this.logger.log(`Product updated with id=${parsedId}`)
        return updated
      } else {
        throw new BadRequestException('Invalid type query parameter')
      }
    } catch (error) {
      this.logger.error(`Error in POST /product: ${error.message}`, error.stack)
      throw error
    }
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Query('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    const productId = parseInt(id, 10)
    if (isNaN(productId)) {
      throw new BadRequestException('Product id must be a number')
    }
    this.logger.log(`POST /product/upload-image called with id=${id}`)
    if (!file) {
      throw new BadRequestException('File is required')
    }
    const host = `${req.protocol}://${req.get('host')}`
    const updatedProduct = await this.productService.uploadProductImage(productId, file, host)
    return updatedProduct
  }

  @Post('upload-classification-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadClassificationImage(
    @Query('id') id: string,
    @Query('index') index: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req
  ) {
    const productId = parseInt(id, 10)
    const classificationIndex = parseInt(index, 10)
    if (isNaN(productId)) {
      throw new BadRequestException('Product id must be a number')
    }
    if (isNaN(classificationIndex)) {
      throw new BadRequestException('Classification index must be a number')
    }
    this.logger.log(`POST /product/upload-classification-image called with id=${id} index=${index}`)
    if (!file) {
      throw new BadRequestException('File is required')
    }
    const host = `${req.protocol}://${req.get('host')}`
    const updatedProduct = await this.productService.uploadClassificationImage(productId, classificationIndex, file, host)
    return updatedProduct
  }

  @Put()
  async handlePut(@Query('type') type: string, @Body() body: any, @Query('id') id?: string) {
    let parsedId: number | null = null
    if (id) {
      parsedId = parseInt(id, 10)
      if (isNaN(parsedId)) {
        throw new BadRequestException('Product id must be a number')
      }
    }
    this.logger.log(`PUT /product called with type=${type} id=${id}`)
    try {
      if (type === 'edit') {
        if (!parsedId) {
          throw new BadRequestException('Product id must be provided for edit')
        }
        const updated = await this.productService.update(parsedId, body)
        this.logger.log(`Product updated with id=${parsedId}`)
        return updated
      } else {
        throw new BadRequestException('Invalid type query parameter for PUT')
      }
    } catch (error) {
      this.logger.error(`Error in PUT /product: ${error.message}`, error.stack)
      throw error
    }
  }

  @Delete()
  async remove(@Query('id', ParseIntPipe) id: number) {
    this.logger.log(`DELETE /product called with id=${id}`)
    if (!id) {
      throw new BadRequestException('Product id must be provided for delete')
    }
    await this.productService.remove(id)
    this.logger.log(`Product deleted with id=${id}`)
    return { message: `Product with id ${id} deleted successfully` }
  }
}
