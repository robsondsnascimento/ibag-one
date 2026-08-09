import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

export function configureApplication(app: INestApplication) {
  app.enableShutdownHooks();
  app.use(helmet());
  app.enableCors({
    origin: allowedCorsOrigins(),
    credentials: false,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.ENABLE_SWAGGER !== 'false') {
    const config = new DocumentBuilder()
      .setTitle('IBAG One API')
      .setDescription('API de gestão ministerial, pastoral, de células e IBAG Kids.')
      .setVersion('1.0.0')
      .addBearerAuth()
      .addSecurityRequirements('bearer')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      customSiteTitle: 'IBAG One API Docs',
      jsonDocumentUrl: 'docs-json',
    });
  }
}

function allowedCorsOrigins() {
  const origins = process.env.CORS_ORIGINS
    ?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (origins?.length) return origins;
  return process.env.NODE_ENV === 'production' ? false : true;
}
