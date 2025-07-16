import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './product.entity';
import { UploadService } from '../upload/upload.service';
import { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import { addDomainToUrl } from '../utils/domain.util';
import { ProductDiscount } from '../discount/product-discount.entity';
import { DiscountCode } from '../discount/discount.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDiscount)
    private readonly productDiscountRepository: Repository<ProductDiscount>,
    @InjectRepository(DiscountCode)
    private readonly discountRepository: Repository<DiscountCode>,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['productDiscounts', 'productDiscounts.discount'],
    });
  }

  async findAllWithActiveDiscounts(): Promise<Product[]> {
    const now = new Date();

    const qb: SelectQueryBuilder<Product> = this.productRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.productDiscounts', 'pd')
      .leftJoinAndSelect('pd.discount', 'd')
      .where('d.active = :active', { active: true })
      .andWhere('d.start_date <= :now', { now })
      .andWhere('d.end_date >= :now', { now });

    return qb.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  async create(createProduct: Partial<Product> & { discountIds?: number[] }): Promise<Product> {
    if (createProduct.price !== undefined) {
      createProduct.price = Math.round(Number(createProduct.price));
    }
    const discountIds = createProduct.discountIds || [];
    delete createProduct.discountIds;

    // Extract classifications if present
    const classifications = createProduct.classifications || [];
    delete createProduct.classifications;

    console.log('createProduct discountIds:', discountIds);
    console.log('createProduct classifications:', classifications);

    const product = this.productRepository.create(createProduct);
    product.classifications = classifications;

    const savedProduct = await this.productRepository.save(product);

    if (discountIds.length > 0) {
      const discounts = await this.discountRepository.findByIds(discountIds);
      console.log('discounts found:', discounts);

      const productDiscounts = discounts.map(discount => {
        return this.productDiscountRepository.create({
          product: savedProduct,
          discount,
        });
      });
      console.log('productDiscounts to save:', productDiscounts);

      await this.productDiscountRepository.save(productDiscounts);
    }

    return this.findOne(savedProduct.id);
  }

  async update(id: number, updateProduct: Partial<Product> & { discountIds?: number[] }): Promise<Product> {
    if (updateProduct.price !== undefined) {
      updateProduct.price = Math.round(Number(updateProduct.price));
    }
    const discountIds = updateProduct.discountIds || [];
    delete updateProduct.discountIds;

    // Extract classifications if present
    const newClassifications = updateProduct.classifications || [];
    delete updateProduct.classifications;

    console.log('updateProduct discountIds:', discountIds);
    console.log('updateProduct classifications:', newClassifications);

    const product = await this.findOne(id);
    Object.assign(product, updateProduct);

    // Merge existing classifications with new ones, preserving old imageUrls if not replaced
    const mergedClassifications = [...(product.classifications || [])];

    newClassifications.forEach((newClass, idx) => {
      if (mergedClassifications[idx]) {
        mergedClassifications[idx].label = newClass.label;
        // Only replace imageUrl if new one is provided (non-empty)
        if (newClass.imageUrl && newClass.imageUrl !== '') {
          mergedClassifications[idx].imageUrl = newClass.imageUrl;
        }
      } else {
        mergedClassifications.push(newClass);
      }
    });

    product.classifications = mergedClassifications;

    const savedProduct = await this.productRepository.save(product);

    // Remove existing productDiscounts
    await this.productDiscountRepository
      .createQueryBuilder()
      .delete()
      .where('product_id = :id', { id })
      .execute();

    if (discountIds.length > 0) {
      const discounts = await this.discountRepository.findByIds(discountIds);
      console.log('discounts found:', discounts);

      const productDiscounts = discounts.map(discount => {
        return this.productDiscountRepository.create({
          product: savedProduct,
          discount,
        });
      });
      console.log('productDiscounts to save:', productDiscounts);

      await this.productDiscountRepository.save(productDiscounts);
    }

    return this.findOne(savedProduct.id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);

    // Delete related order_items before deleting product to avoid foreign key constraint error
    await this.productRepository
      .createQueryBuilder()
      .relation('orderItems') // assuming relation name is 'orderItems'
      .of(product)
      .remove(await this.getOrderItemsByProductId(id));

    await this.productRepository.remove(product);
  }

  // Helper method to get order items by product id
  private async getOrderItemsByProductId(productId: number) {
    // Assuming you have an OrderItem repository injected, otherwise you need to inject it
    // For now, using query builder to fetch order items
    const orderItems = await this.productRepository.manager
      .createQueryBuilder()
      .select('order_item')
      .from('order_item', 'order_item')
      .where('order_item.productId = :productId', { productId })
      .getMany();
    return orderItems;
  }

  async uploadProductImage(productId: number, file: Express.Multer.File, host?: string): Promise<Product> {
    const imageUrl = await this.uploadService.uploadImage(file, 'product');
    const product = await this.findOne(productId);
    const domain = host || this.configService.get<string>('app.host') || '';
    product.imageUrl = addDomainToUrl(imageUrl, domain);
    return this.productRepository.save(product);
  }

  async uploadClassificationImage(productId: number, index: number, file: Express.Multer.File, host?: string): Promise<Product> {
    // Fix: use valid folder name for upload service
    const imageUrl = await this.uploadService.uploadImage(file, 'product');
    const product = await this.findOne(productId);
    const domain = host || this.configService.get<string>('app.host') || '';
    const fullImageUrl = addDomainToUrl(imageUrl, domain);

    if (!product.classifications) {
      product.classifications = [];
    }

    // Ensure the classifications array has enough length
    while (product.classifications.length <= index) {
      product.classifications.push({ label: '', imageUrl: '' });
    }

    product.classifications[index].imageUrl = fullImageUrl;

    return this.productRepository.save(product);
  }
}
