import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { ProductDiscount } from './product-discount.entity'

export enum DiscountType {
  PERCENT = 'percent',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
}

@Entity('discount_codes')
export class DiscountCode {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number

  @Column({ type: 'varchar', length: 255, nullable: false, default: '' })
  name: string

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  code: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string

  @Column({ type: 'enum', enum: DiscountType, default: DiscountType.PERCENT })
  discount_type: DiscountType

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: false })
  discount_value: number

  @Column({ type: 'int', default: 1 })
  usage_limit: number

  @Column({ type: 'int', default: 0 })
  used_count: number

  @Column({ type: 'datetime', nullable: true })
  start_date: Date

  @Column({ type: 'datetime', nullable: true })
  end_date: Date

  @Column({ type: 'boolean', default: true })
  active: boolean

  @Column({ type: 'int', nullable: true })
  min_order: number | null

  @OneToMany(() => ProductDiscount, (productDiscount) => productDiscount.discount)
  productDiscounts: ProductDiscount[]

  @CreateDateColumn({ type: 'timestamp', default: null })
  created_at: Date

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date
}
