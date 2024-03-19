import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { ApiKeyAuthGuard } from './auth/guard/apiKey-auth.guard';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //   Security
  app.useGlobalGuards(new ApiKeyAuthGuard());
  app.enableCors();
  app.use(helmet());

  app.enableVersioning({ type: VersioningType.URI });

  // OpenAPI nestjs swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Orgax API')
    .setDescription(
      'Organizes your data in a way that is easy to access  manage and understand with the power of large language models. ',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-KEY',
        in: 'header',
        description: 'API key for authentication of registered applications',
      },
      'apiKey',
    )
    .addTag('orgax-api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //   Global Pipes
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
