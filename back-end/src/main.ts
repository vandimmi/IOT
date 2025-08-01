import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { startTelegramBot } from './telegram/telegram.bot';

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
  try {
    console.log("🔔 Starting Telegram bot...");
    await startTelegramBot();
    console.log("✅ Bot started");
  } catch (err) {
    console.error("❌ Bot failed to start", err);
  }

  await app.listen(PORT);
  console.log(`🚀 Application is running on: http://localhost:${PORT}/api`);
}
bootstrap();
