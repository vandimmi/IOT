// src/telegram/telegram.bot.ts
import { Bot } from "grammy";
import axios from "axios";

let botInstance: Bot | null = null;

export async function startTelegramBot() {
  if (botInstance) {
    console.log("⚠️ Telegram bot already running");
    return botInstance;
  }
  console.log("🔔 Initializing Telegram bot...");

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    throw new Error("❌ TELEGRAM_BOT_TOKEN not set");
  }

  const bot = new Bot(token);
  botInstance = bot;
  if (!botInstance) {
    throw new Error("❌ Failed to create Telegram bot instance");
  }
  else {
    console.log("✅ Telegram bot instance created");
  }
  console.log("✅ Telegram bot initialized");

  bot.command("start", async (ctx) => {
    const text = ctx.message?.text ?? "";
    const parts = text.split(" ");
    const email = parts[1]; // /start <email>
    const chatId = ctx.chat.id;

    if (!email) {
      return ctx.reply("❗️Bạn cần truy cập bot từ hệ thống để liên kết.");
    }

    try {
      await axios.post("http://localhost:8080/api/telegram/connect", {
        email,
        chatId,
      });
      ctx.reply("✅ Đã liên kết Telegram bot thành công!");
    } catch (err) {
      ctx.reply("❌ Liên kết thất bại.");
      console.error(err);
    }
  });

  try {
  console.log("🔔 Starting Telegram bot...");
  await bot.api.deleteWebhook();
console.log("🔧 Webhook deleted");

  await bot.start();
  console.log("✅ Telegram bot started");
} catch (err) {
  console.error("❌ Bot start failed:", err);
}

  console.log("✅ Telegram bot started");

  return bot;
}
