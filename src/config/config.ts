export default () => ({
  app: {
    host: process.env.APP_HOST,
    port: process.env.APP_PORT || 3000,
    origin01: process.env.APP_ORIGIN_01,
    origin02: process.env.APP_ORIGIN_02,
    apiKey: process.env.SENDGRID_KEY,
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  auth: {
    secretKey: process.env.SECRET_KEY,
    jwtExpiration: process.env.JWT_EXPIRATION,
    jwtRefeshExpiration: process.env.JWT_REFRESH_EXPIRATION,
  },
})
