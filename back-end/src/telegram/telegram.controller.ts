import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly usersService: UsersService) {}

  @Post('connect')
  async connectTelegram(@Body() body: { email: string; chatId: number }) {
    const { email, chatId } = body;
    return this.usersService.saveChatId(email, chatId);
  }
}