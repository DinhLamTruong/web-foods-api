// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  Get,
  Req,
  Patch,
} from '@nestjs/common'
import {AuthService} from '@auth/auth.service'
import {JwtAuthGuard} from '@auth/jwt-auth.guard'
import {AuthGuard} from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const {email, password} = body
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.authService.login(user)
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Body() body) {
    const {userId} = body
    return this.authService.logout(userId)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt')) // Use the JWT guard to protect this route
  async me(@Req() req) {
    return req.user // Return the user info attached to the request by the guard
  }

  @Post('register')
  async register(@Body() body) {
    const {username, password, email, imageUrl} = body
    await this.authService.register(username, password, email || '', imageUrl || '')
  }

  @Post('refresh')
  async refresh(@Body() body) {
    const {refreshToken} = body
    return this.authService.refresh(refreshToken)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Body() body, @Req() req) {
    const {currentPassword, newPassword} = body
    const userId = req.user.userId // Get the user ID from the request
    await this.authService.changePassword(userId, currentPassword, newPassword)
    return {message: 'Password updated successfully'}
  }
}
