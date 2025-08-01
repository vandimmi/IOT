import { Controller, Get, Query } from '@nestjs/common';
import { TelegramService } from '../telegram/telegram.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../modules/users/schemas/user.schema';

@Controller('test')
export class TestController {
  constructor(
    private readonly telegramService: TelegramService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Get('send-telegram')
  async testSendTelegram(@Query('email') email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      return { error: 'Không tìm thấy người dùng với email này' };
    }

    if (!user.chat_id) {
      return { error: 'Người dùng chưa liên kết Telegram' };
    }

    await this.telegramService.sendMessage(
      user.chat_id,
      '🧪 Đây là tin nhắn test từ hệ thống!',
    );

    return { success: true, message: 'Đã gửi Telegram test!' };
  }
}
