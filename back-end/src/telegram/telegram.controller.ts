import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
  ) {}

  @Post('link')
  async linkTelegram(@Body() body: { email: string; chatId: number }) {
    const { email, chatId } = body;

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    user.chat_id = chatId;
    await user.save();

    return { message: 'Telegram linked successfully' };
  }
}
