// telegram.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('webhook')
  async handleWebhook(@Body() update: any) {
    console.log('Webhook update:', JSON.stringify(update, null, 2));

    if (update.message) {
      const chatId = update.message.chat.id.toString();
      const username = update.message.from.username;

      // Lưu chat_id vào DB
      await this.telegramService.saveChatId({username, chatId});

      // Gửi trả lời lại user
      await this.telegramService.sendMessage(
        chatId,
        `✅ Bot đã lưu chat_id của bạn: ${chatId}`
      );
    }

    return { ok: true };
  }
}
