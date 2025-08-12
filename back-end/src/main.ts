import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { bot } from './telegram/telegram.bot';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get('PORT'); // Default port if use local
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: configService.get<string>('MQTT_URL'),
      username: configService.get<string>('MQTT_USERNAME'),
      password: configService.get<string>('MQTT_PASSWORD'),
      //clientId: 'nestjs-backend-' + uuidv4(),
    },
  });

  app.setGlobalPrefix('api', { exclude: [''] });

  app.enableCors({
    origin: configService.get('https://iot-5.onrender.com') || '*',
    // origin: configService.get('http://localhost:5500') || '*',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.startAllMicroservices().then(() => {
    console.log('✅ MQTT microservice is running');
  });
  await app.listen(process.env.PORT ?? 8080);
  // await bot.start();
  // console.log("✅ Telegram bot started");
}
bootstrap();
