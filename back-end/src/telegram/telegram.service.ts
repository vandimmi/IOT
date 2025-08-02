import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private bot: Bot;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
    this.bot = new Bot(token);
  }

  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
    } catch (error) {
      console.error('❌ Failed to send Telegram message:', error);
    }
  }
}
