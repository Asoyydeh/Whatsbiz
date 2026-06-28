import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to /api
  app.setGlobalPrefix('api');

  // Configure global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins for dev; update in prod
    credentials: true,
  });

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('WhatsBiz CRM API')
    .setDescription('WhatsBiz CRM - Multi-Tenant WhatsApp CRM SaaS API Specification')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`[WhatsBiz Backend] Server is running on 0.0.0.0:${port}`);
  console.log(`[WhatsBiz Backend] Swagger documentation available at: http://localhost:${port}/docs`);
}
bootstrap();
