import { Module } from '@nestjs/common';
import { MqttService } from './mqtt.service';
import { In4ArduinoModule } from '../modules/in4_arduino/in4_arduino.module';
import { SettingModule } from 'src/settingPage/setting.module';

@Module({
  imports: [In4ArduinoModule, SettingModule],
  providers: [MqttService],
})
export class MqttModule {}
