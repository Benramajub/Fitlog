import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cfg = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: false,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));
  app.enableCors({
    origin: cfg.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  const port = cfg.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`🚀 FitLog API running on http://localhost:${port}/api`);
}
bootstrap();
