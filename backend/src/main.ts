import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // CORS - allow frontend origins
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://62.171.139.44:3000',
      'http://62.171.139.44',
    ],
    credentials: true,
  });

  // Global validation pipe - validates all incoming DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,    // Strip unknown properties
    transform: true,    // Auto-transform payloads to DTO instances
    forbidNonWhitelisted: true, // Throw error for unknown properties
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 NextClin Backend running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
