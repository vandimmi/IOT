import { Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
import { Bot } from 'grammy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Bot;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');
    this.bot = new Bot(token);
  }

  async onModuleInit() {
    this.bot.command('start', async (ctx) => {
      const chatId = ctx.chat.id;
      const username = ctx.from?.username || '';
      const email = ctx.message?.text?.split(' ')[1]; // start <email>
      if (!email) {
        return ctx.reply('Bạn cần cung cấp email để liên kết tài khoản.');
      }

      await this.usersService.saveChatId(email, chatId);
      await ctx.reply(`Xin chào ${username}, bạn đã liên kết bot thành công!`);
    });

    await this.bot.start();
  }

  sendMessage(chatId: number | string, text: string) {
    return this.bot.api.sendMessage(chatId, text);
  }
}
