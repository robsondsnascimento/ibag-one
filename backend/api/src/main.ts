import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApplication } from './app.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApplication(app);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
