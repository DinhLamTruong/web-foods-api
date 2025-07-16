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
  categoryType: string

  @Column({default: 0})
  quantity: number

  @Column({type: 'decimal', precision: 10, scale: 0})
  price: number

  @Column({name: 'image_url', nullable: true})
  imageUrl?: string

  @Column({default: false})
  bestSelling: boolean

  @Column({default: false})
  suggestion: boolean

  @OneToMany(() => ProductDiscount, (productDiscount) => productDiscount.product)
  productDiscounts: ProductDiscount[]

  @CreateDateColumn({name: 'created_at', default: null})
  createdAt: Date

  @UpdateDateColumn({name: 'updated_at', default: null})
  updatedAt: Date

  @Column({ type: 'json', nullable: true })
  classifications?: { label: string; imageUrl: string }[]
}
