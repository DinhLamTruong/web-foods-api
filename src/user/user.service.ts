import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { Repository, DeepPartial } from 'typeorm'
import { User } from './user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcryptjs'
import { UploadService } from '../upload/upload.service'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly uploadService: UploadService
  ) {}

  async findAll(): Promise<Partial<User>[]> {
    return this.usersRepository.find({
      select: ['id', 'username', 'email', 'role', 'imageUrl'],
    })
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    await this.usersRepository.delete(userId)
  }

  async findOneByUsername(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } })
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken })
  }

  async createUser(
    username: string,
    password: string,
    email: string,
    imageUrl: string
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10)
    const userData: DeepPartial<User> = {
      email: email,
      password: hashedPassword,
      username: username, // or set default name same as email or empty string
      role: 'admin',
      imageUrl: imageUrl,
    }
    const user = this.usersRepository.create(userData)
    return this.usersRepository.save(user)
  }

  async validateRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user || !user.refreshToken) {
      return false
    }
    return user.refreshToken === refreshToken
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    const passwordValid = await bcrypt.compare(currentPassword, user.password)
    if (!passwordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    user.password = hashedNewPassword
    await this.usersRepository.save(user)
  }

  async uploadUserAvatar(userId: number, file: Express.Multer.File): Promise<User> {
    const imageUrl = await this.uploadService.uploadImage(file, 'avatar')
    const user = await this.usersRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    user.imageUrl = imageUrl
    return this.usersRepository.save(user)
  }
}
