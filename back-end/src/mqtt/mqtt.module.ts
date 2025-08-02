import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { In4ArduinoModule } from '../modules/in4_arduino/in4_arduino.module';

@Module({
  imports: [In4ArduinoModule],
  providers: [MqttService],
})
export class MqttModule {}
