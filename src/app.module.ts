import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProductController } from './product/product.controller'
import { ProductService } from './product/product.service'
import { ProductModule } from './product/product.module'
// import {UserController} from './user/user.controller'
// import {UserService} from './user/user.service'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import config from '@config/config'
import typeorm from '@config/typeorm'
import { UserController } from './user/user.controller'
import { UploadModule } from './upload/upload.module'
import { NewsModule } from './news/news.module'
import { OrderController } from './order/order.controller';
import { OrderModule } from './order/order.module';
import { SearchController } from './search/search.controller';
import { SearchModule } from './search/search.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';
import { ContactController } from './contact/contact.controller';
import { ContactModule } from './contact/contact.module';
import { DiscountModule } from './discount/discount.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config, typeorm],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get('typeorm')
        if (!config) {
          throw new Error('TypeORM configuration is not defined')
        }
        return config
      },
    }),
    AuthModule,
    UserModule,
    DiscountModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('auth.secretKey'),
        signOptions: { expiresIn: configService.get<string>('auth.jwtExpiration') },
      }),
      inject: [ConfigService],
    }),
    ProductModule,
    UploadModule,
    NewsModule,
    OrderModule,
    SearchModule,
    DashboardModule,
    PublicModule,
    ContactModule,
  ],
  controllers: [AppController, ProductController, UserController, ContactController],
  providers: [AppService, ProductService, UserController],
})
export class AppModule {}
