/* eslint-disable prettier/prettier */
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany} from 'typeorm'
import { ProductDiscount } from '../discount/product-discount.entity'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 150})
  name: string

  @Column({type: 'text', nullable: true})
  description?: string

  @Column({type: 'text', nullable: true})
  categoryType?: string

  @Column({default: 0})
  quantity: number

  @Column({type: 'decimal', precision: 10, scale: 0})
  price: number

  @Column({ type: 'decimal', precision: 10, scale: 0, nullable: true })
  discounted?: number

  @Column({name: 'image_url', nullable: true})
  imageUrl?: string

  @Column({default: false})
  bestSelling: boolean

  @Column({default: false})
  suggestion: boolean

  @OneToMany(() => ProductDiscount, (productDiscount) => productDiscount.product)
  productDiscounts: ProductDiscount[]

  @Column({ type: 'json', nullable: true })
  highlights?: any[]

  @Column({ type: 'json', nullable: true })
  shipping?: any

  @Column({ type: 'json', nullable: true })
  variantsItems?: any[]

  @Column({ type: 'json', nullable: true })
  options?: any[]

  @Column({ type: 'json', nullable: true })
  tags?: any[]

  @Column({ type: 'json', nullable: true })
  gifts?: any[]

  @CreateDateColumn({name: 'created_at', default: null})
  createdAt: Date

  @UpdateDateColumn({name: 'updated_at', default: null})
  updatedAt: Date

  @Column({ type: 'json', nullable: true })
  classifications?: { label: string; imageUrl: string }[]
}
