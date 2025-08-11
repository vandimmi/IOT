import { Body, Controller, Post } from '@nestjs/common';
import { EventPattern, Payload, Ctx, MqttContext, Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { In4ArduinoService } from '../modules/in4_arduino/in4_arduino.service';
import { SettingService } from '../settingPage/setting.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { lastValueFrom } from 'rxjs';

class EspConfigDto {
    ssid?: string;
    pass?: string;
    mq2?: number;
    mq7?: number;
    mq135?: number;
    temp?: number;
}

@Controller()
export class MqttService {
    private mqttPub: ClientProxy;
    constructor(
        private readonly in4ArduinoService: In4ArduinoService,
        private readonly settingService: SettingService,
        private readonly configService: ConfigService,
    ) {
        this.mqttPub = ClientProxyFactory.create({
            transport: Transport.MQTT,
            options: {
                url: this.configService.get<string>('MQTT_URL'),
                username: this.configService.get<string>('MQTT_USERNAME'),
                password: this.configService.get<string>('MQTT_PASSWORD'),
                // Nếu dùng HiveMQ Cloud TLS thì URL phải là mqtts://...:8883
            },
        });
    }
    @Post('esp32/config')
    async sendEspConfig(@Body() dto: EspConfigDto) {
        const topic = 'device/config'; // ESP32 đang subscribe topic này
        await lastValueFrom(this.mqttPub.emit(topic, dto));
        return { ok: true, topic, sent: dto };
    }

    @EventPattern('sensor/data')
    async handleMessage(@Payload() data: any, @Ctx() context: MqttContext) {
        console.log('📩 MQTT Received:', data);
        const payload = typeof data === 'string' ? JSON.parse(data) : data;
        try {
            // Chuyển đổi và xác thực dữ liệu nhận được
            const parsedData = {
                mq2: Number(payload.mq2),
                mq7: Number(payload.mq7),
                mq135: Number(payload.mq135),
                temperature: Number(payload.temperature),
                flame: Boolean(payload.flame),
                wifissid: String(payload.wifissid || ''), // Thêm trường wifissid
                wifipass: String(payload.wifipass || ''), // Thêm trường
            };

            // Gọi service lưu vào MongoDB
            await this.in4ArduinoService.save(parsedData);
            console.log('✅ Dữ liệu đã lưu MongoDB');
        } catch (err) {
            console.error('❌ Lỗi khi lưu dữ liệu:', err);
        }
    }
}
