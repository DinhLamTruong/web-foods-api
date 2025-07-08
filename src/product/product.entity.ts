/* eslint-disable prettier/prettier */
import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm'

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

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date
}
