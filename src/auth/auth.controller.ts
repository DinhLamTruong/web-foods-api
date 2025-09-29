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
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    return req.user; // Return the user info attached to the request by the guard
  }

  @Post('register')
  async register(@Body() body: { username: string; password: string; email?: string; imageUrl?: string }) {
    const { username, password, email = '', imageUrl = '' } = body;
    if (!username || !password) {
      throw new BadRequestException('Username and password are required');
    }
    const result = await this.authService.register(username, password, email, imageUrl);
    return { message: 'User registered successfully', userId: result.user.id };
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    const { refreshToken } = body;
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refresh(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Body() body: { currentPassword: string; newPassword: string }, @Req() req) {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Current and new passwords are required');
    }
    const userId = req.user.userId; // Get the user ID from the request
    await this.authService.changePassword(userId, currentPassword, newPassword);
    return { message: 'Password updated successfully' };
  }
}
