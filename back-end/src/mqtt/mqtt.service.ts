import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { EventPattern, Payload, Ctx, MqttContext, Transport, ClientProxyFactory, ClientProxy } from '@nestjs/microservices';
import { In4ArduinoService } from '../modules/in4_arduino/in4_arduino.service';
import { SettingService } from '../settingPage/setting.service';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../modules/users/users.service';
import { emit } from 'process';

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
        private readonly usersService: UsersService,
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
                email: String(payload.email || ''), // Thêm trường email
            };

            // Gọi service lưu vào MongoDB
            await this.in4ArduinoService.save(parsedData);
            console.log('✅ Dữ liệu đã lưu MongoDB');


            // Gọi service để lấy ngưỡng cài đặt
            const thresholds = await this.settingService.getThresholds(1, parsedData.email);
            const t = thresholds[0]; // lấy bản ghi mới nhất
            const alerts: string[] = [];

            // Kiểm tra vượt ngưỡng
            if (!parsedData.flame) alerts.push("🔥 Phát hiện có lửa");
            if (parsedData.temperature > t.temp) alerts.push(`🌡 Nhiệt độ cao (> ${t.temp})`);
            if (parsedData.mq2*100/4095 > t.MQ2) alerts.push(`💨 MQ2 vượt ngưỡng (> ${t.MQ2})`);
            if (parsedData.mq7*100/4095 > t.MQ7) alerts.push(`💨 MQ7 vượt ngưỡng (> ${t.MQ7})`);
            if (parsedData.mq135*100/4095 > t.MQ135) alerts.push(`💨 MQ135 vượt ngưỡng (> ${t.MQ135})`);

            // Chỉ gửi nếu có cháy hoặc vượt ngưỡng
            if (alerts.length > 0) {
                const message =
                    `🚨 Cảnh báo cảm biến:\n` +
                    `MQ2: ${(parsedData.mq2*100/4095).toFixed(1)} %\n` +
                    `MQ7: ${(parsedData.mq7*100/4095).toFixed(1)} %\n` +
                    `MQ135: ${(parsedData.mq135*100/4095).toFixed(1)} %\n` +
                    `Nhiệt độ: ${parsedData.temperature}\n` +
                    `Lửa: ${parsedData.flame ? 'Có' : 'Không'}\n\n` +
                    `⚠ Tình trạng: ${alerts.join(', ')}`;

                await this.usersService.notifyUser(parsedData.email, message);
            }
        } catch (err) {
            console.error('❌ Lỗi khi lưu dữ liệu:', err);
        }
    }
}
