import { TelegramService } from '../telegram/telegram.service';
import { UsersService } from '../modules/users/users.service';
import { Controller, Post, Body, NotFoundException } from '@nestjs/common';

@Controller('alert')
export class AlertController {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly usersService: UsersService,
  ) {}

  @Post('notify')
  async sendAlert(@Body('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user?.chat_id) {
      throw new NotFoundException('Người dùng chưa liên kết Telegram');
    }

    await this.telegramService.sendMessage(user.chat_id, '🚨 Có cảnh báo mới!');
    return { message: 'Đã gửi Telegram' };
  }
}
