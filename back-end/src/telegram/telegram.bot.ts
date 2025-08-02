import { Bot } from "grammy";
import * as dotenv from 'dotenv';
import { UsersService } from "../modules/users/users.service";
import { NestFactory } from "@nestjs/core/nest-factory";
import { AppModule } from "../app.module";
import { TelegramController} from "./telegram.controller";
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set in environment variables");
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const text = ctx.message?.text || "";

  const args = text.split(" ");
  const email = args[1]; 

  if (!email) {
    await ctx.reply("❌ Bạn cần mở bot với lệnh /start <email> để liên kết tài khoản.");
    return;
  }

  const chatId = ctx.chat.id;

  await ctx.reply("🤖 Bot đã liên kết thành công với tài khoản!");
  try {
    const app = await NestFactory.create(AppModule);
    const telegramController = app.get(TelegramController);
    await telegramController.linkTelegram({ email, chatId });
  } catch (error: any) {
    console.error("❌ Lưu chatId thất bại:", error.message);
  }
});

export { bot };
