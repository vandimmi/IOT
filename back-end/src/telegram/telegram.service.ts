import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from '../modules/users/schemas/user.schema';

@Injectable()
export class TelegramService {
  private token = process.env.TELEGRAM_TOKEN;
  private api = `https://api.telegram.org/bot${this.token}`;

  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async sendMessage(chatId: string, text: string) {
    try {
      await axios.post(`${this.api}/sendMessage`, {
        chat_id: chatId,
        text,
      });
    } catch (error) {
      console.error('❌ Telegram sendMessage error:', error.response?.data || error.message);
    }
  }

  async saveChatId({ username, chatId }: { username: string; chatId: string }) {
    const user = await this.userModel.findOneAndUpdate(
      { username },
      { $set: { chat_id: chatId } },
      { new: true }
    );

    if (!user) {
      console.warn(`⚠️ User ${username} not found to save chat_id`);
    } else {
      console.log(`✅ chat_id saved for user ${username}: ${chatId}`);
    }
  }
}
