import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { Product } from '../product/product.entity'
import { DiscountCode } from './discount.entity'

@Entity('product_discounts')
export class ProductDiscount {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Product, (product) => product.productDiscounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product

  @ManyToOne(() => DiscountCode, (discount) => discount.productDiscounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'discount_id' })
  discount: DiscountCode
}
