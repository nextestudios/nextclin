import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Security headers
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://62.171.139.44:3000',
      'http://62.171.139.44',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('NextClin API')
    .setDescription('API do sistema ERP para Clínicas de Vacinação — SaaS Multi-tenant')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticação e MFA')
    .addTag('patients', 'Gestão de Pacientes e Prontuário')
    .addTag('appointments', 'Agendamentos')
    .addTag('attendances', 'Fila de Atendimento')
    .addTag('vaccines', 'Vacinas e Lotes')
    .addTag('stock', 'Estoque')
    .addTag('financial', 'Financeiro')
    .addTag('nfse', 'Notas Fiscais')
    .addTag('notifications', 'Notificações e Mensagens')
    .addTag('reports', 'Relatórios')
    .addTag('subscription', 'Planos e Billing')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 NextClin Backend running on port ${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
