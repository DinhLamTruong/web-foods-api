import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  email: string;

  @Column({ default: '' })
  fullName: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: false })
  agreeTerms: boolean;

  @Column({ nullable: true, type: 'text' })
  discountCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  district: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  province: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  ward: string;

  @Column({ default: '' })
  paymentMethod: string;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column({ default: '' })
  shippingMethod: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ default: 'pending' })
  status: string;

  @Column('decimal', { precision: 10, scale: 0, default: 0 })
  totalPrice: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  timestamp: string;

  @Column({ default: 0 })
  totalItems: number;

  @Column({ default: 0 })
  totalQuantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  items: OrderItem[];
}

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  imageUrl: string;

  @Column('decimal', { precision: 10, scale: 0 })
  price: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;
}
