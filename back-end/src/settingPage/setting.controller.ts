import { Controller, Get, Post, Body } from '@nestjs/common';
import { SettingService } from './setting.service';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get()
  getSettings() {
    console.log('[GET /settings] Trả về ngưỡng cài đặt');
    return this.settingService.getThresholds();
  }

  @Post()
  updateSettings(@Body() body: any) {
    console.log('[POST /settings] Dữ liệu nhận từ frontend:', body);
    this.settingService.updateThresholds(body);
    return { message: 'Updated successfully' };
  }
}
