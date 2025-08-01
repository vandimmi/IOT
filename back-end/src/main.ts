import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { bot } from './telegram/telegram.bot';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');


  app.setGlobalPrefix('api', { exclude: [''] });

  app.enableCors({
    origin: configService.get('http://localhost:5500') || '*',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 8080);
  await bot.start();
  console.log("✅ Telegram bot started");
}
bootstrap();
