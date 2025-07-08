import {Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus, UseInterceptors, UploadedFile, BadRequestException, Delete, Param, ForbiddenException} from '@nestjs/common'
import {AuthService} from 'src/auth/auth.service'
import {JwtAuthGuard} from 'src/auth/jwt-auth.guard'
import {User} from './user.entity'
import {UserService} from './user.service'
import {FileInterceptor} from '@nestjs/platform-express'
import { RoleGuard } from 'src/auth/role.guard'
import { SetMetadata } from '@nestjs/common'

@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  // @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.userService.findAll()
    return users.map(user => ({
      userId: user.id,
      email: user.email,
      name: user.email,
      role: user.role,
    }))
  }

  @Post('register')
  async register(@Body() user: User) {
    return this.authService.register(
      user.username,
      user.password,
      user.email || '',
      user.imageUrl || ''
      // user.role
    )
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() user: User) {
    const validatedUser = await this.authService.validateUser(user.email, user.password)
    if (!validatedUser) {
      return {message: 'Invalid credentials'}
    }
    if (validatedUser.role !== 'admin') {
      return {message: 'Access denied: insufficient permissions'}
    }
    return this.authService.login(validatedUser)
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() body: {currentPassword: string; newPassword: string}
  ) {
    const userId = req.user.userId
    await this.authService.changePassword(userId, body.currentPassword, body.newPassword)
    return {message: 'Password changed successfully'}
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.userId
    if (!file) {
      throw new BadRequestException('File is required')
    }
    const updatedUser = await this.userService.uploadUserAvatar(userId, file)
    return updatedUser
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteUser(@Request() req) {
    const userId = req.user.userId
    await this.userService.deleteUser(userId)
    return { message: 'User account deleted successfully' }
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['admin'])
  async deleteUserById(@Request() req, @Body('id') id: number) {
    if (id === req.user.userId) {
      throw new ForbiddenException('Cannot delete the currently logged-in user');
    }
    await this.userService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }
}
