import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SettingService } from './setting.service';
import { link } from 'fs';

@Controller('settings')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Get('get')
  getSettings(@Query('limit') limit: number) {
    console.log('[GET /settings] Trả về ngưỡng cài đặt');
    return this.settingService.getThresholds(limit);
  }

  @Post('create')
  createSettings(@Body() body: any) {
    console.log('[POST /settings] Dữ liệu nhận từ frontend:', body);
    this.settingService.createThresholds(body);
    return { message: 'Created successfully' };
  }

  @Post('update')
  updateSettings(@Body() body: any) {
    console.log('[POST /settings] Dữ liệu nhận từ frontend:', body);
    this.settingService.updateThresholds(body);
    return { message: 'Updated successfully' };
  }
}
