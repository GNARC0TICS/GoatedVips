import TelegramBot from "node-telegram-bot-api";
import { db } from "@db";
import { telegramUsers, verificationRequests } from "@db/schema/telegram";
import { API_CONFIG } from "../config/api";
import { eq } from "drizzle-orm";

// Enhanced debugging
const DEBUG = true;

const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log("[Telegram Bot Debug]", ...args);
  }
};

// Bot instance
let bot: TelegramBot;
let isReconnecting = false;
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

// Initialize bot with enhanced error handling
const initializeBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN is not set in environment variables!");
    throw new Error("TELEGRAM_BOT_TOKEN is required!");
  }

  try {
    debugLog("Initializing bot with token:", process.env.TELEGRAM_BOT_TOKEN.slice(0, 10) + "...");

    bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: {
        interval: 300,
        autoStart: true,
        params: {
          timeout: 10,
          allowed_updates: ["message", "callback_query"],
        }
      },
      filepath: false,
    });

    setupBotEventHandlers();
    setupCommandHandlers();

    return bot;
  } catch (error) {
    console.error("Failed to initialize bot:", error);
    throw error;
  }
};

const setupBotEventHandlers = () => {
  // Connection verification
  bot.getMe().then((botInfo) => {
    console.log(`✅ Bot connected successfully as @${botInfo.username}`);
    debugLog("Full bot info:", JSON.stringify(botInfo, null, 2));
    reconnectAttempts = 0; // Reset reconnection counter on successful connection
  }).catch((error) => {
    console.error("❌ Failed to connect bot:", error.message);
    handleReconnection();
  });

  // Enhanced error handling for polling
  bot.on("polling_error", (error: any) => {
    console.error("⚠️ Polling Error:", {
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    });

    if (error.code === 401) {
      console.error("❌ Authentication failed. Please check your TELEGRAM_BOT_TOKEN");
    } else if (error.code === 409) {
      console.error("❌ Conflict: Another bot instance is running");
    }

    handleReconnection();
  });

  // Enhanced general error handling
  bot.on("error", (error: Error) => {
    console.error("⚠️ Telegram Bot Error:", {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });
    handleReconnection();
  });

  // Health monitoring
  bot.on("message", (msg) => {
    debugLog("📨 Received message:", {
      chatId: msg.chat.id,
      text: msg.text,
      from: msg.from?.username,
      timestamp: new Date().toISOString()
    });
  });
};

const handleReconnection = async () => {
  if (isReconnecting || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

  isReconnecting = true;
  reconnectAttempts++;

  console.log(`🔄 Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);

  try {
    await bot.stopPolling();
    await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY));
    await bot.startPolling();

    isReconnecting = false;
    console.log("✅ Reconnection successful");
  } catch (error) {
    console.error("❌ Reconnection failed:", error);
    isReconnecting = false;

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      handleReconnection();
    } else {
      console.error("❌ Max reconnection attempts reached. Manual intervention required.");
    }
  }
};

// Safe message sending with rate limiting and error handling
const safeSendMessage = async (chatId: number, text: string, options = {}) => {
  try {
    const now = Date.now();
    const lastMessageTime = messageRateLimiter.get(chatId) || 0;

    if (now - lastMessageTime < RATE_LIMIT_WINDOW) {
      debugLog(`Rate limit applied for chat: ${chatId}`);
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_WINDOW));
    }

    messageRateLimiter.set(chatId, now);
    return await bot.sendMessage(chatId, text, { ...options, disable_web_page_preview: true });
  } catch (error: any) {
    console.error(`Error sending message to ${chatId}:`, error.message);
    try {
      return await bot.sendMessage(chatId, text.replace(/[<>]/g, "").trim(), {
        ...options,
        parse_mode: undefined,
        disable_web_page_preview: true,
      });
    } catch (secondError: any) {
      console.error(`Failed to send even a simplified message to ${chatId}:`, secondError.message);
    }
  }
};

// Setup command handlers
const setupCommandHandlers = () => {
  // Start command
  bot.onText(/\/start/, async (msg) => {
    console.log("📝 Start command received from:", msg.chat.id);
    await safeSendMessage(msg.chat.id, "🎮 Welcome to GoatedVIPs Affiliate Bot!\nUse /verify to link your account.");
  });

  // Play command
  bot.onText(/\/play/, async (msg) => {
    console.log("📝 Play command received from:", msg.chat.id);
    await safeSendMessage(msg.chat.id, "🎮 Play on Goated: https://goatedvips.gg/?ref=telegram");
  });

  // Website command
  bot.onText(/\/website/, async (msg) => {
    console.log("📝 Website command received from:", msg.chat.id);
    await safeSendMessage(msg.chat.id, "🌐 Visit: https://goatedvips.gg");
  });

  // Verify command
  bot.onText(/\/verify (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match?.[1]?.trim();
    if (!username) return safeSendMessage(chatId, "Usage: /verify your_platform_username");

    try {
      const existingUser = await db.select().from(telegramUsers).where(eq(telegramUsers.telegramId, chatId.toString())).limit(1);
      if (existingUser.length > 0 && existingUser[0].isVerified) {
        return safeSendMessage(chatId, "✅ Already verified!");
      }

      await db.insert(verificationRequests).values({
        telegramId: chatId.toString(),
        goatedUsername: username,
        status: "pending",
        telegramUsername: msg.from?.username || null,
      });

      await safeSendMessage(chatId, "✅ Verification request submitted. An admin will review it shortly.");
      await safeSendMessage(1689953605, `🔔 Verification Request:\nUser: ${username}\nTelegram: @${msg.from?.username}`);
    } catch (error) {
      console.error("Verification error:", error);
      await safeSendMessage(chatId, "❌ Error processing verification. Try again later.");
    }
  });

  // Stats command
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
      const userStats = data.data.monthly.data.find((p: any) => p.name.toLowerCase() === user.goatedUsername?.toLowerCase());

      if (!userStats) return safeSendMessage(chatId, "❌ No stats found for your account this period.");

      const position = data.data.monthly.data.findIndex((p: any) => p.name.toLowerCase() === user.goatedUsername?.toLowerCase()) + 1;
      await safeSendMessage(chatId, `📊 Stats for ${user.goatedUsername}:\n💰 Wagered: $${userStats.wagered.this_month.toFixed(2)}\n📍 Position: #${position}`);
    } catch (error) {
      console.error("Stats error:", error);
      await safeSendMessage(chatId, "❌ Error fetching stats. Try again later.");
    }
  });


  // Leaderboard command
  bot.onText(/\/leaderboard/, async (msg) => {
    const chatId = msg.chat.id;
    console.log("📝 Leaderboard command received from:", chatId);

    try {
      console.log("Fetching leaderboard data...");
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.leaderboard}`, {
        headers: { Authorization: `Bearer ${process.env.API_TOKEN || API_CONFIG.token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as LeaderboardResponse;
      console.log("Leaderboard data received:", {
        totalUsers: data.metadata.totalUsers,
        lastUpdated: data.metadata.lastUpdated
      });

      const top10 = data.data.monthly.data.slice(0, 10);
      if (!top10.length) return safeSendMessage(chatId, "❌ No leaderboard data available.");

      const leaderboardMessage = top10
        .map((player, i) => `#${i + 1} ${player.name} - 💰 $${player.wagered.this_month.toFixed(2)}`)
        .join("\n");
      await safeSendMessage(chatId, `🏆 Monthly Leaderboard:\n\n${leaderboardMessage}`);
    } catch (error) {
      console.error("Leaderboard error:", error);
      await safeSendMessage(chatId, "❌ Error fetching leaderboard. Try again later.");
    }
  });
};

// Rate limiting setup
const messageRateLimiter = new Map<number, number>();
const RATE_LIMIT_WINDOW = 1000; // 1 second

// Initialize the bot
const bot = initializeBot();

export { bot };