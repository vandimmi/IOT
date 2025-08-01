import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { In4ArduinoService } from '../modules/in4_arduino/in4_arduino.service';

@Controller()
export class MqttService {
    constructor(private readonly in4ArduinoService: In4ArduinoService) { }

    @EventPattern('esp32/data')
    async handleMessage(@Payload() data: any, @Ctx() context: MqttContext) {
        console.log('📩 MQTT Received:', data);

        try {
            // Chuyển đổi và xác thực dữ liệu nhận được
            const parsedData = {
                mq2: Number(data.mq2),
                mq7: Number(data.mq7),
                mq135: Number(data.mq135),
                temperature: Number(data.temperature),
                flame: Boolean(data.flame),
            };

            // Gọi service lưu vào MongoDB
            await this.in4ArduinoService.save(parsedData);
            console.log('✅ Dữ liệu đã lưu MongoDB');
        } catch (err) {
            console.error('❌ Lỗi khi lưu dữ liệu:', err);
        }
    }
}
