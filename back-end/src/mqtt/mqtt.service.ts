import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
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
    @Post('esp32/config') // => POST /api/esp32/config
    async sendConfig(@Body() dto: any, @Res() res: Response) {
        try {
            console.log('HTTP /esp32/config ->', dto);
            await this.mqttPub.connect(); // đảm bảo đã kết nối broker, log lỗi nếu fail
            console.log('✅ MQTT client connected');
            await lastValueFrom(this.mqttPub.emit('device/config', dto)); // publish lên topic ESP32 đang sub
            console.log('✅ Published to topic device/config');
            return res.status(200).json({ ok: true });
        } catch (e: any) {
            console.error('❌ MQTT publish failed:', e?.message || e);
            return res.status(502).json({ ok: false, error: String(e?.message || e) });
        }
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
