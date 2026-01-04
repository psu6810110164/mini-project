import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  app.setGlobalPrefix('api');

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true, 
  }));

  const port = configService.get<number>('APP_PORT') || 3000;

  await app.listen(port);
  console.log(`-------------------------------------------------------`);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
  console.log(`📊 Database connected to Port: ${configService.get('DB_PORT')}`);
  console.log(`-------------------------------------------------------`);
}
bootstrap();