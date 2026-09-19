import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({ origin: process.env.FRONTEND, credentials: true })
  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
