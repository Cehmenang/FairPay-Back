import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({ 
    origin: process.env.FRONTEND ?? 'https://fairpay.cehwin.cloud', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true })
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
