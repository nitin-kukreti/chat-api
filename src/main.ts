import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setDescription('API documentation for the Chat application')
    .setVersion('1.0')
    .addBearerAuth() // Add authorization for Bearer tokens
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(3000);
}
bootstrap();
