import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  name: string

  @Column({ nullable: false })
  email: string

  @Column({ type: 'text', nullable: false })
  message: string

  @Column({ nullable: false })
  phone: string
}
