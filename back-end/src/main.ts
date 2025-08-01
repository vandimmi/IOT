import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const PORT = configService.get('PORT');
  app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.MQTT,
  options: {
    url: 'mqtts://195d12f952ea4bbba0db56a9e044028f.s1.eu.hivemq.cloud:8883',
    username: 'NPT100', // nếu bạn đã cấu hình
    password: 'Phuctho100',
    //clientId: 'nestjs-backend-' + uuidv4(),
  },
});


  app.setGlobalPrefix('api', { exclude: [''] });

  app.enableCors({
    origin: configService.get('http://localhost:5500') || '*',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.startAllMicroservices().then(() => {
    console.log('✅ MQTT microservice is running');
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
