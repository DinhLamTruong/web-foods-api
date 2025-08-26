/* eslint-disable prettier/prettier */
import {registerAs} from '@nestjs/config'
import {config as dotenvConfig} from 'dotenv'
import {DataSource, DataSourceOptions} from 'typeorm'

dotenvConfig({path: '.env'})

const port = parseInt(process.env.DB_PORT || '', 10)

if (!process.env.DB_HOST) {
  console.error('DB_HOST environment variable is not set')
}
if (!port || isNaN(port)) {
  console.error('DB_PORT environment variable is not set or invalid')
}
if (!process.env.DB_USERNAME) {
  console.error('DB_USERNAME environment variable is not set')
}
if (!process.env.DB_PASSWORD) {
  console.error('DB_PASSWORD environment variable is not set')
}
if (!process.env.DB_NAME) {
  console.error('DB_NAME environment variable is not set')
}

const config = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: port,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: true,
  autoLoadEntities: true,
  synchronize: true,
}

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions)
