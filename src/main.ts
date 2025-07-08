import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'
import {ConfigService} from '@nestjs/config'
import * as bodyParser from 'body-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('app.port') ?? 3001

  app.setGlobalPrefix('api')

  const allowedOrigins = [
    configService.get<string>('app.origin01'),
    configService.get<string>('app.origin02'),
    'http://localhost:5174',
    'http://localhost:5173',
    'http://192.168.1.46:5173',
  ].filter((origin) => !!origin)
  
  // Enable CORS with custom configuration
  app.enableCors({
    origin: true, // Allow all origins for development/testing
    methods: 'GET,POST,PUT,PATCH,DELETE', // Allow only specific methods
    allowedHeaders: 'Content-Type, Authorization', // Allow specific headers
    credentials: true, // Allow sending credentials like cookies
  })

  // Increase body size limit to 10mb
  app.use(bodyParser.json({ limit: '10mb' }))
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

  await app.listen(port)
}
bootstrap()
