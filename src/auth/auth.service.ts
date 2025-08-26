// src/auth/auth.service.ts
import {Injectable, UnauthorizedException} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
// import {UsersService} from '@user/users.service'
import {UserService} from 'src/user/user.service'
import * as bcrypt from 'bcryptjs'
import {ConfigService} from '@nestjs/config'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username)
    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if user has admin role
      if (user.role !== 'admin') {
        // User is not admin, deny login
        return null
      }
      return {id: user.id, email: user.email, role: user.role}
    }
    return null
  }

  async login(user: any) {
    const payload = {email: user.email, sub: user.id, role: user.role}
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('auth.jwtRefeshExpiration'),
    })

    await this.usersService.updateRefreshToken(user.id, refreshToken)

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      access_token: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('auth.jwtExpiration'),
      }),
      refresh_token: refreshToken,
    }
  }

  async logout(userId: number) {
    return this.usersService.updateRefreshToken(userId, null)
  }

  async register(
    username: string,
    password: string,
    email: string,
    imageUrl: string,
    // role: string
  ) {
    const user = await this.usersService.createUser(username, password, email, imageUrl)
    return this.login(user)
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken)
    const isValid = await this.usersService.validateRefreshToken(payload.sub, refreshToken)
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token')
    }
    const user = await this.usersService.findOneByUsername(payload.username)
    return this.login(user)
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    return this.usersService.changePassword(userId, currentPassword, newPassword)
  }
}
