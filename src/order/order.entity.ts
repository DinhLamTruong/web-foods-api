import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Product } from '../product/product.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  fullName: string;

  @Column({ default: '' })
  phone: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: false })
  agreeTerms: boolean;

  @Column({ nullable: true })
  discountCode: string;

  @Column({ default: '' })
  district: string;

  @Column({ default: '' })
  province: string;

  @Column({ default: '' })
  ward: string;

  @Column({ default: '' })
  paymentMethod: string;

  @Column({ default: 'pending' })
  paymentStatus: string;

  @Column({ default: '' })
  shippingMethod: string;

  @Column({ nullable: true })
  note: string;

  @Column({ default: 'pending' })
  status: string;

  @Column('decimal', { precision: 10, scale: 0, default: 0 })
  totalPrice: number;

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

  // @Column()
  // title: string;

  // @Column({ default: '' })
  // unit: string;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;
}
