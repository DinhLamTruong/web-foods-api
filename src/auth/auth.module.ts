import {Module} from '@nestjs/common'
import {AuthService} from '@auth/auth.service'
import {AuthController} from '@auth/auth.controller'
import {UserModule} from '@user/user.module'
import {PassportModule} from '@nestjs/passport'
import {JwtModule} from '@nestjs/jwt'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {JwtStrategy} from '@auth/jwt.strategy'

@Module({
  imports: [
    ConfigModule,
    UserModule, // Add UsersModule here
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secretKey'),
        signOptions: {expiresIn: configService.get<string>('auth.jwtExpiration')},
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
