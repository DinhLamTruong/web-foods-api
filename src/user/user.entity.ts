/* eslint-disable prettier/prettier */
import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({length: 100})
  username: string

  @Column({unique: true, length: 100})
  email: string

  @Column({name: 'image', length: 255, nullable: true})
  imageUrl?: string

  @Column({length: 255})
  password: string

  @Column({type: 'enum', enum: ['admin', 'user'], default: 'user'})
  role: 'admin' | 'user'

  @Column({type: 'varchar', length: 500, nullable: true})
  refreshToken: string | null

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date
}
