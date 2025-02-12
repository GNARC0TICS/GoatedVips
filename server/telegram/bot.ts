import TelegramBot from "node-telegram-bot-api";
import { db } from "@db";
import { telegramUsers, verificationRequests } from "@db/schema/telegram";
import { API_CONFIG } from "../config/api";
import { transformLeaderboardData } from "../routes";
import { eq } from "drizzle-orm";

// 🌐 Rate limiting setup to prevent spam
const messageRateLimiter = new Map<number, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const MAX_MESSAGES_PER_WINDOW = 3;

// 🛡️ Safe Message Sending with Rate Limiting
const safeSendMessage = async (chatId: number, text: string, options = {}) => {
  try {
    const now = Date.now();
    const lastMessageTime = messageRateLimiter.get(chatId) || 0;

    if (now - lastMessageTime < RATE_LIMIT_WINDOW) {
      console.warn(`Rate limit applied for chat: ${chatId}`);
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_WINDOW));
    }

    messageRateLimiter.set(chatId, now);

    console.log(`Sending message to chat: ${chatId}`);
    return await bot.sendMessage(chatId, text, {
      ...options,
      disable_web_page_preview: true,
    });
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    try {
      return await bot.sendMessage(chatId, text.replace(/[<>]/g, "").trim(), {
        ...options,
        parse_mode: undefined,
        disable_web_page_preview: true,
      });
    } catch (secondError: any) {
      console.error("Failed to send even a simplified message:", secondError.message);
    }
  }
};

// 🌟 Ensure environment variables are set
if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error("❌ TELEGRAM_BOT_TOKEN is required!");

// 🤖 Bot Initialization
let bot: TelegramBot;
try {
  console.log("🔹 Initializing Telegram bot...");
  bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: { interval: 300, autoStart: true, params: { timeout: 10 } },
    filepath: false,
  });

  // 🔍 Error Handling
  bot.on("polling_error", (error) => console.error("⚠️ Polling Error:", error.message));
  bot.on("error", (error) => console.error("⚠️ Telegram Bot Error:", error.message));

  // 🔄 Logging Messages
  bot.on("message", (msg) => {
    console.log(`📩 Message from @${msg.from?.username}:`, msg.text);
  });

  // 🛠️ Setup Commands
  const setupCommands = async () => {
    console.log("📌 Setting up bot commands...");
    await bot.setMyCommands([
      { command: "start", description: "🚀 Start using the bot" },
      { command: "verify", description: "🔐 Link your Goated account" },
      { command: "stats", description: "📊 Check your wager stats" },
      { command: "leaderboard", description: "🏆 See top players" },
      { command: "play", description: "🎮 Play on Goated" },
      { command: "website", description: "🌐 Visit GoatedVIPs.gg" },
      { command: "help", description: "❓ Get help using the bot" },
    ]);
    console.log("✅ Bot commands initialized.");
  };

  // 🚀 Initialize Bot
  const initializeBot = async () => {
    const botInfo = await bot.getMe();
    console.log(`🤖 Bot Ready: ${botInfo.username}`);
    await setupCommands();
  };

  initializeBot().catch((error) => {
    console.error("🚨 Bot Initialization Error:", error);
    process.exit(1);
  });

} catch (error) {
  console.error("🚨 Failed to create bot instance:", error);
  throw error;
}

// 🛡️ Admin Check Utility
const isAdmin = async (chatId: number) => chatId.toString() === "1689953605";

// 🌟 Command Handlers
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  await safeSendMessage(chatId, "🎮 Welcome to GoatedVIPs Affiliate Bot!\nUse /verify to link your account.");
});

bot.onText(/\/play/, async (msg) => {
  const chatId = msg.chat.id;
  await safeSendMessage(chatId, "🎮 Play on Goated: https://goatedvips.gg/?ref=telegram");
});

bot.onText(/\/website/, async (msg) => {
  const chatId = msg.chat.id;
  await safeSendMessage(chatId, "🌐 Visit: https://goatedvips.gg");
});

// 🏆 Leaderboard Command
bot.onText(/\/leaderboard/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`, {
      headers: { Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch leaderboard");

    const data = await response.json();
    const stats = transformLeaderboardData(data);
    const top10 = stats.data.monthly.data.slice(0, 10);

    const leaderboardMessage = top10.map((player, i) => `#${i + 1} ${player.name} - 💰 $${player.wagered.this_month.toFixed(2)}`).join("\n");
    await safeSendMessage(chatId, `🏆 Monthly Leaderboard:\n\n${leaderboardMessage}`);
  } catch (error) {
    console.error("Leaderboard error:", error);
    await safeSendMessage(chatId, "❌ Error fetching leaderboard. Try again later.");
  }
});

// 🔐 Verification Command
bot.onText(/\/verify (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match?.[1]?.trim();
  if (!username) return safeSendMessage(chatId, "Usage: /verify your_platform_username");

  try {
    const existingUser = await db.select().from(telegramUsers).where(eq(telegramUsers.telegramId, chatId.toString())).limit(1);
    if (existingUser.length > 0 && existingUser[0].isVerified) return safeSendMessage(chatId, "✅ Already verified!");

    await db.insert(verificationRequests).values({ telegramId: chatId.toString(), goatedUsername: username, status: "pending" });

    await safeSendMessage(chatId, "✅ Verification request submitted. An admin will review it shortly.");
    await safeSendMessage(1689953605, `🔔 Verification Request:\nUser: ${username}\nTelegram: @${msg.from?.username}`);
  } catch (error) {
    console.error("Verification error:", error);
    await safeSendMessage(chatId, "❌ Error processing verification. Try again later.");
  }
});

// 📊 Stats Command
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const [user] = await db.select().from(telegramUsers).where(eq(telegramUsers.telegramId, chatId.toString())).limit(1);
    if (!user?.isVerified) return safeSendMessage(chatId, "❌ Please verify your account using /verify");

    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`, {
      headers: { Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch stats");

    const data = await response.json();
    const stats = transformLeaderboardData(data);
    const monthlyStats = stats.data.monthly.data[0];

    if (!monthlyStats) return safeSendMessage(chatId, "❌ No stats found for this period.");

    await safeSendMessage(chatId, `📊 Stats:\n💰 Wagered: $${monthlyStats.wagered.this_month.toFixed(2)}\n📍 Position: #${stats.data.monthly.data.findIndex((p) => p.name === monthlyStats.name) + 1}`);
  } catch (error) {
    console.error("Stats error:", error);
    await safeSendMessage(chatId, "❌ Error fetching stats. Try again later.");
  }
});

export { bot };