import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { In4ArduinoService } from '../modules/in4_arduino/in4_arduino.service';
import { SettingService } from '../settingPage/setting.service';

@Controller()
export class MqttService {
    constructor(
        private readonly in4ArduinoService: In4ArduinoService,
        private readonly settingService: SettingService,
    ) { }

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

    // @EventPattern('esp32/getThresholds')
    // async getThresholds(@Ctx() context: MqttContext) {
    //     console.log('📩 MQTT Request for thresholds');
    //     try {
    //         const thresholds = await this.settingService.getThresholds();
    //         console.log('📤 Sending thresholds:', thresholds);
    //         return thresholds;
    //     } catch (err) {
    //         console.error('❌ Error fetching thresholds:', err);
    //         throw err; // Rethrow to let the caller handle it
    //     }
    // }
}
