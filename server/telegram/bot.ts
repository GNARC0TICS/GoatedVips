import { z } from "zod";
import TelegramBot from "node-telegram-bot-api";
import { db } from "@db";
import { telegramUsers, verificationRequests } from "@db/schema/telegram";
import { users } from "@db/schema/users";
import { eq } from "drizzle-orm";
import { log, logError, logAction } from "./utils/logger";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

// Custom animated emojis and stickers
const CUSTOM_EMOJIS = {
  logo: "🐐", // Will be replaced with actual file_id
  welcome: "✨",
  stats: "📊",
  leaderboard: "🏆",
  play: "🎲",
  race: "🏃",
  banned: "⛔",
  admin: "👑",
  error: "❌",
  success: "✅",
  mvp: "🌟",
  live: "🔴"
};

// Rate limiter setup
const rateLimiter = new RateLimiterMemory({
  points: 20,
  duration: 60,
});

const BOT_COMMANDS = [
  { command: '/start', description: 'Start the bot and see welcome message' },
  { command: '/help', description: 'Show available commands' },
  { command: '/verify', description: 'Link your Goated account' },
  { command: '/menu', description: 'Show main menu with quick links' },
  { command: '/status', description: 'Check your verification status' },
  { command: '/bonuscodes', description: 'Get latest bonus codes (verified users)' },
  { command: '/notifications', description: 'Toggle notifications' },
  { command: '/pending', description: 'View pending verification requests (admins)' },
  { command: '/stats', description: 'View platform statistics (admins)' }
];

// Message templates with consistent branding
const MESSAGES = {
  welcome: `
${CUSTOM_EMOJIS.logo} *Welcome to the VIP Bot!*

Your gateway to exclusive rewards and VIP benefits!

🌟 *VIP Features:*
• ${CUSTOM_EMOJIS.stats} Real-time stats tracking
• ${CUSTOM_EMOJIS.leaderboard} Exclusive tournaments
• ${CUSTOM_EMOJIS.play} Special promotions
• ${CUSTOM_EMOJIS.mvp} Priority support
• ${CUSTOM_EMOJIS.race} Enhanced rewards

🎮 *Available Commands:*
• Type /verify to link your account
• Use /menu to see quick links
• Check /status for your VIP level

${CUSTOM_EMOJIS.live} *Join the Community:*
• Daily races and challenges
• VIP-only events
• Special member perks

Ready to join the elite? Use /verify to get started!
`.trim(),

  menu: `
${CUSTOM_EMOJIS.logo} *Quick Links*

${CUSTOM_EMOJIS.play} *Gaming:*
• [Play Now](https://www.Goated.com/play)
• [Tournaments](https://www.Goated.com/tournaments)
• [Challenges](https://www.Goated.com/challenges)

${CUSTOM_EMOJIS.stats} *Account:*
• [VIP Status](https://www.Goated.com/vip)
• [Rewards](https://www.Goated.com/rewards)
• [Profile](https://www.Goated.com/profile)

${CUSTOM_EMOJIS.leaderboard} *Community:*
• [Leaderboard](https://www.Goated.com/leaderboard)
• [Race Stats](https://www.Goated.com/races)
• [Rankings](https://www.Goated.com/rankings)
`.trim(),

  help: (isAdmin: boolean) => `
${CUSTOM_EMOJIS.logo} *VIP Bot Commands*

📱 *General Commands:*
• /start - Get started
• /help - Show this menu
• /verify - Link your account
• /menu - Quick links
• /status - Check VIP status
• /notifications - Toggle alerts
• /bonuscodes - Get bonus codes

${isAdmin ? `
${CUSTOM_EMOJIS.admin} *Admin Commands:*
• /pending - View verifications
• /stats - Platform statistics
• /broadcast - Send announcements` : ''}

Need help? Contact @xGoombas
`.trim(),

  verifyInstructions: `
${CUSTOM_EMOJIS.logo} *Account Verification*

To verify your account:
1️⃣ Type: /verify YourUsername
2️⃣ Example: /verify JohnDoe123

*Note:* Make sure to use your exact username
`.trim(),

  verificationSubmitted: `
${CUSTOM_EMOJIS.success} *Verification Request Submitted!*

Your request has been received and will be processed shortly.
You'll receive a notification once verified.

${CUSTOM_EMOJIS.mvp} While waiting:
• Check out /help for available commands
• Join our VIP community: @GoatedVIP
• Use /menu to explore features
`.trim(),

  status: (user: any) => `
${CUSTOM_EMOJIS.success} *Account Status:*
• Telegram: @${user.telegramUsername}
• User ID: ${user.userId}
• Verified: ${user.isVerified ? `${CUSTOM_EMOJIS.success}` : `${CUSTOM_EMOJIS.error}`}
• Notifications: ${user.notificationsEnabled ? '🔔' : '🔕'}
${user.verifiedAt ? `• Verified On: ${new Date(user.verifiedAt).toLocaleDateString()}` : ''}
`.trim(),

  bonusCodes: `${CUSTOM_EMOJIS.mvp} *Latest Bonus Codes:*\n\nVIPBOOST - New user promotion\n\nMore codes coming soon!`,

  pendingRequests: (requests: any[]) => requests.map((request: any) =>
    `${CUSTOM_EMOJIS.admin} Verification Request:\nTelegram: @${request.telegramUsername}\nID: ${request.userId}`
  ).join('\n\n'),

  stats: (verifiedUsers: number, pendingRequests: number) => `
${CUSTOM_EMOJIS.stats} *Platform Statistics:*

${CUSTOM_EMOJIS.mvp} Verified Users: ${verifiedUsers}
${CUSTOM_EMOJIS.play} Pending Requests: ${pendingRequests}
`.trim()
};

// Helper function to create inline keyboards
function createMainMenu(isVerified: boolean = false) {
  return {
    inline_keyboard: [
      [
        { text: isVerified ? `${CUSTOM_EMOJIS.stats} My Status` : `${CUSTOM_EMOJIS.logo} Verify Account`,
          callback_data: isVerified ? "status" : "verify" }
      ],
      [
        { text: `${CUSTOM_EMOJIS.mvp} Bonus Codes`, callback_data: "bonuscodes" },
        { text: `${CUSTOM_EMOJIS.play} Quick Links`, callback_data: "menu" }
      ],
      [
        { text: "🔔 Notifications", callback_data: "notifications" },
        { text: "❓ Help", callback_data: "help" }
      ]
    ]
  };
}

// Add menu command handler
async function handleMenu(msg: TelegramBot.Message) {
  try {
    await safeSendMessage(msg.chat.id, MESSAGES.menu, {
      parse_mode: "Markdown",
      disable_web_page_preview: true // Prevents link previews from cluttering the menu
    });
  } catch (error) {
    if (error instanceof Error) {
      logError(error, 'Menu command');
    }
  }
}

export async function initializeBot(): Promise<TelegramBot | null> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    log("❌ TELEGRAM_BOT_TOKEN is not set!");
    return null;
  }

  try {
    log("Starting Telegram bot initialization...");

    // Determine mode based on environment
    const options: TelegramBot.ConstructorOptions = {
      filepath: false // Disable file downloads
    };

    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
      options.webHook = {
        port: parseInt(process.env.WEBHOOK_PORT || '8443')
      };
    } else {
      options.polling = true;
    }

    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, options);
    botInstance = bot;

    // Set webhook in production
    if (process.env.NODE_ENV === 'production' && process.env.WEBHOOK_URL) {
      await bot.setWebHook(`${process.env.WEBHOOK_URL}/bot${process.env.TELEGRAM_BOT_TOKEN}`);
      log("Webhook set successfully");
    }

    log("Bot instance created, setting up event handlers...");

    // Set bot commands
    await bot.setMyCommands(BOT_COMMANDS);

    // Handle errors
    bot.on('error', (error: Error) => {
      logError(error, 'Bot error');
    });

    bot.on('polling_error', (error: Error) => {
      logError(error, 'Polling error');
    });

    // Start command
    bot.onText(/\/start/, async (msg) => {
      await handleStart(msg);
    });

    // Help command
    bot.onText(/\/help/, async (msg) => {
      await handleHelp(msg);
    });


    // Status command
    bot.onText(/\/status/, async (msg) => {
      await handleStatus(msg);
    });

    //Verify command
    bot.onText(/\/verify/, async (msg) => {
      await handleVerify(msg);
    });

    // Menu command
    bot.onText(/\/menu/, async (msg) => {
      await handleMenu(msg);
    });

    // Notifications command
    bot.onText(/\/notifications/, async (msg) => {
      await handleNotifications(msg);
    });

    // Bonus Codes command
    bot.onText(/\/bonuscodes/, async (msg) => {
      await handleBonusCodes(msg);
    });

    // Pending command
    bot.onText(/\/pending/, async (msg) => {
      await handlePending(msg);
    });

    // Stats command
    bot.onText(/\/stats/, async (msg) => {
      await handleStats(msg);
    });


    // Handle callback queries (button clicks) with rate limiting
    bot.on('callback_query', async (query) => {
      if (!query.message || !query.from.id) return;

      try {
        await rateLimiter.consume(query.from.id.toString());
        await handleCallbackQuery(query);
      } catch (error) {
        if (error instanceof RateLimiterRes) {
          await bot.answerCallbackQuery(query.id, {
            text: "⚠️ Please wait before making more requests",
            show_alert: true
          });
        } else if (error instanceof Error) {
          log(`Error handling callback query: ${error.message}`);
        }
      }
    });

    // Handle all other messages with rate limiting
    bot.on("message", async (msg) => {
      if (!msg.text || !msg.from?.id) return;

      try {
        await rateLimiter.consume(msg.from.id.toString());
        await handleMessage(msg);
      } catch (error) {
        if (error instanceof RateLimiterRes) {
          await safeSendMessage(msg.chat.id, "⚠️ Please wait before sending more commands.");
        } else if (error instanceof Error) {
          log(`Error handling message: ${error.message}`);
        }
      }
    });

    const botInfo = await bot.getMe();
    log(`✅ Bot initialized successfully as @${botInfo.username}`);
    startHealthCheck();
    return bot;
  } catch (error) {
    if (error instanceof Error) {
      logError(error, 'Bot initialization');
    }
    return null;
  }
}

async function handleMessage(msg: TelegramBot.Message) {
  if (!msg.text) return;

  logAction({
    action: 'Received Message',
    userId: msg.from?.username || 'unknown',
    success: true,
    details: `Command: ${msg.text}`
  });

  const [command, ...args] = msg.text.split(" ");

  try {
    switch (command) {
      case '/verify':
        await handleVerify(msg, args[0]);
        break;
      case '/pending':
        await handlePending(msg);
        break;
      case '/help':
        await handleHelp(msg);
        break;
      case '/notifications':
        await handleNotifications(msg);
        break;
      case '/bonuscodes':
        await handleBonusCodes(msg);
        break;
      case '/stats':
        await handleStats(msg);
        break;
      case '/menu':
        await handleMenu(msg);
        break;
      default:
        if (command.startsWith('/')) {
          logAction({
            action: 'Unknown Command',
            userId: msg.from?.username || 'unknown',
            success: false,
            details: command
          });
          await safeSendMessage(msg.chat.id, "Unknown command. Use /help to see available commands.");
        }
    }
  } catch (error) {
    if (error instanceof Error) {
      logError(error, `Error handling command ${command}`);
      await safeSendMessage(msg.chat.id, "❌ An error occurred. Please try again later.");
    }
  }
}

async function handleStart(msg: TelegramBot.Message) {
  try {
    logAction({
      action: 'Start Command',
      userId: msg.from?.username,
      success: true
    });

    const user = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, msg.from.id.toString()))
      .limit(1);
    const isVerified = user.length > 0 && user[0].isVerified;

    await safeSendMessage(msg.chat.id, MESSAGES.welcome, {
      parse_mode: "Markdown",
      reply_markup: createMainMenu(isVerified)
    });
  } catch (error) {
    if (error instanceof Error) {
      logError(error, 'Start command');
    }
  }
}

async function handleVerify(msg: TelegramBot.Message, goatedUsername?: string) {
  if (!botInstance || !msg.from?.username) {
    return safeSendMessage(msg.chat.id, "❌ Please set a Telegram username first.");
  }

  if (!goatedUsername) {
    return safeSendMessage(msg.chat.id, MESSAGES.verifyInstructions, { parse_mode: "Markdown" });
  }

  try {
    // Check if already verified
    const existing = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, msg.from.id.toString()))
      .limit(1);

    if (existing[0]) {
      logAction({
        action: 'Verification Attempt',
        userId: msg.from.username,
        success: false,
        details: 'Account already verified'
      });
      return safeSendMessage(msg.chat.id, "✅ Your account is already verified!");
    }

    // Create verification request
    await db.insert(verificationRequests).values({
      telegramId: msg.from.id.toString(),
      telegramUsername: msg.from.username,
      userId: parseInt(goatedUsername), // Convert to integer as per schema
      status: "pending"
    });

    logAction({
      action: 'Verification Request',
      userId: msg.from.username,
      success: true,
      details: `Requested verification for Goated ID: ${goatedUsername}`
    });

    await safeSendMessage(msg.chat.id, MESSAGES.verificationSubmitted, { parse_mode: "Markdown" });

    // Notify admins
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.isAdmin, true));

    for (const admin of admins) {
      if (!admin.telegramId) continue;

      const buttons = {
        inline_keyboard: [[
          { text: "✅ Approve", callback_data: `approve:${msg.from.username}` },
          { text: "❌ Reject", callback_data: `reject:${msg.from.username}` }
        ]]
      };

      await botInstance.sendMessage(
        parseInt(admin.telegramId),
        `🆕 New verification request:\n` +
        `Telegram: @${msg.from.username}\n` +
        `Goated: ${goatedUsername}`,
        { reply_markup: buttons }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      logError(error, 'Verification process');
      await safeSendMessage(msg.chat.id, "❌ Error submitting request. Please try again later.");
    }
  }
}

async function handlePending(msg: TelegramBot.Message) {
  if (!botInstance) return;

  try {
    const admin = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, msg.from!.id.toString()))
      .limit(1);

    if (!admin[0]?.isAdmin) {
      return safeSendMessage(msg.chat.id, "❌ This command is for admins only.");
    }

    const pending = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'pending'));

    if (pending.length === 0) {
      return safeSendMessage(msg.chat.id, "✅ No pending requests!");
    }

    await safeSendMessage(msg.chat.id, MESSAGES.pendingRequests(pending), { parse_mode: "Markdown" });
  } catch (error) {
    if (error instanceof Error) {
      log(`Error listing pending requests: ${error.message}`);
      await safeSendMessage(msg.chat.id, "❌ Error fetching pending requests.");
    }
  }
}

async function handleApproval(request: any, adminId: string, query: TelegramBot.CallbackQuery) {
  if (!botInstance) return;

  try {
    // Update request status
    await db
      .update(verificationRequests)
      .set({
        status: 'approved',
        verifiedAt: new Date(),
        verifiedBy: adminId
      })
      .where(eq(verificationRequests.telegramUsername, request.telegramUsername));

    // Create verified user entry
    await db
      .insert(telegramUsers)
      .values({
        telegramId: request.telegramId,
        telegramUsername: request.telegramUsername,
        userId: request.userId,
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: adminId
      });

    await botInstance.editMessageText(
      `✅ Approved @${request.telegramUsername}`,
      {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id
      }
    );

    await botInstance.sendMessage(
      parseInt(request.telegramId),
      "✅ Your account has been verified! Welcome to Goated!"
    );

    await botInstance.answerCallbackQuery(query.id, {
      text: "User approved successfully",
      show_alert: true
    });
  } catch (error) {
    if (error instanceof Error) {
      log(`Error approving user: ${error.message}`);
      await botInstance.answerCallbackQuery(query.id, {
        text: "Error approving user",
        show_alert: true
      });
    }
  }
}

async function handleRejection(request: any, adminId: string, query: TelegramBot.CallbackQuery) {
  if (!botInstance) return;

  try {
    await db
      .update(verificationRequests)
      .set({
        status: 'rejected',
        verifiedAt: new Date(),
        verifiedBy: adminId
      })
      .where(eq(verificationRequests.telegramUsername, request.telegramUsername));

    await botInstance.editMessageText(
      `❌ Rejected @${request.telegramUsername}`,
      {
        chat_id: query.message?.chat.id,
        message_id: query.message?.message_id
      }
    );

    await botInstance.sendMessage(
      parseInt(request.telegramId),
      "❌ Your verification request was rejected. Please ensure you provided the correct Goated username and try again with /verify."
    );

    await botInstance.answerCallbackQuery(query.id, {
      text: "User rejected successfully",
      show_alert: true
    });
  } catch (error) {
    if (error instanceof Error) {
      log(`Error rejecting user: ${error.message}`);
      await botInstance.answerCallbackQuery(query.id, {
        text: "Error rejecting user",
        show_alert: true
      });
    }
  }
}

async function handleNotifications(msg: TelegramBot.Message) {
  if (!msg.from?.id) return;

  try {
    const user = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, msg.from.id.toString()))
      .limit(1);

    if (!user[0]) {
      return safeSendMessage(msg.chat.id, "❌ Please verify your account first using /verify");
    }

    const newStatus = !user[0].notificationsEnabled;

    await db
      .update(telegramUsers)
      .set({ notificationsEnabled: newStatus })
      .where(eq(telegramUsers.telegramId, msg.from.id.toString()));

    await safeSendMessage(
      msg.chat.id,
      `✅ Notifications ${newStatus ? 'enabled' : 'disabled'} successfully!`
    );
  } catch (error) {
    if (error instanceof Error) {
      log(`Error toggling notifications: ${error.message}`);
      await safeSendMessage(msg.chat.id, "❌ Error updating notification preferences.");
    }
  }
}

async function handleBonusCodes(msg: TelegramBot.Message) {
  if (!msg.from?.id) return;

  try {
    const user = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, msg.from.id.toString()))
      .limit(1);

    if (!user[0]?.isVerified) {
      return safeSendMessage(msg.chat.id, "❌ This command is only available for verified users.");
    }

    await safeSendMessage(
      msg.chat.id,
      MESSAGES.bonusCodes,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    if (error instanceof Error) {
      log(`Error fetching bonus codes: ${error.message}`);
      await safeSendMessage(msg.chat.id, "❌ Error fetching bonus codes.");
    }
  }
}

async function handleStats(msg: TelegramBot.Message) {
  if (!msg.from?.id) return;

  try {
    const admin = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, msg.from.id.toString()))
      .limit(1);

    if (!admin[0]?.isAdmin) {
      return safeSendMessage(msg.chat.id, "❌ This command is for admins only.");
    }

    const verifiedUsers = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.isVerified, true));

    const pendingRequests = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.status, 'pending'));

    await safeSendMessage(msg.chat.id, MESSAGES.stats(verifiedUsers.length, pendingRequests.length), { parse_mode: "Markdown" });
  } catch (error) {
    if (error instanceof Error) {
      log(`Error fetching stats: ${error.message}`);
      await safeSendMessage(msg.chat.id, "❌ Error fetching platform statistics.");
    }
  }
}

async function handleHelp(msg: TelegramBot.Message) {
  const isAdmin = await checkIsAdmin(msg.from?.id?.toString());
  await safeSendMessage(msg.chat.id, MESSAGES.help(isAdmin), { parse_mode: "Markdown" });
}

async function checkIsAdmin(telegramId?: string): Promise<boolean> {
  if (!telegramId) return false;

  try {
    const admin = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    return !!admin[0]?.isAdmin;
  } catch (error) {
    if (error instanceof Error) {
      log(`Error checking admin status: ${error.message}`);
    }
    return false;
  }
}

async function handleCallbackQuery(query: TelegramBot.CallbackQuery) {
  if (!query.message || !query.from.id) {
    log("Received callback query without message");
    return;
  }

  logAction({
    action: 'Callback Query',
    userId: query.from.username,
    success: true,
    details: `Action: ${query.data}`
  });

  try {
    switch (query.data) {
      case 'menu':
        await handleMenu(query.message);
        break;

      case 'verify':
        await botInstance?.sendMessage(
          query.message.chat.id,
          MESSAGES.verifyInstructions,
          { parse_mode: "Markdown" }
        );
        break;

      case 'help':
        const isAdmin = await checkIsAdmin(query.from.id.toString());
        await botInstance?.sendMessage(
          query.message.chat.id,
          MESSAGES.help(isAdmin),
          { parse_mode: "Markdown" }
        );
        break;

      case 'status':
        await handleStatus({ ...query.message, from: query.from });
        break;

      case 'bonuscodes':
        await handleBonusCodes({ ...query.message, from: query.from });
        break;

      case 'notifications':
        await handleNotifications({ ...query.message, from: query.from });
        break;

      default:
        if (query.data?.startsWith('approve:') || query.data?.startsWith('reject:')) {
          const [action, username] = query.data.split(':');
          const adminId = query.from.id.toString();

          const request = await db
            .select()
            .from(verificationRequests)
            .where(eq(verificationRequests.telegramUsername, username))
            .limit(1);

          if (!request[0]) {
            return botInstance?.answerCallbackQuery(query.id, {
              text: "❌ Request not found",
              show_alert: true
            });
          }

          if (action === 'approve') {
            await handleApproval(request[0], adminId, query);
          } else {
            await handleRejection(request[0], adminId, query);
          }
        }
    }

    await botInstance?.answerCallbackQuery(query.id);
  } catch (error) {
    if (error instanceof Error) {
      logError(error, 'Callback query handler');
      await botInstance?.answerCallbackQuery(query.id, {
        text: "❌ Error processing request",
        show_alert: true
      });
    }
  }
}

async function handleStatus(msg: TelegramBot.Message) {
  if (!msg.from?.id) return;

  try {
    const user = await db
      .select()
      .from(telegramUsers)
      .where(eq(telegramUsers.telegramId, msg.from.id.toString()))
      .limit(1);

    if (!user[0]) {
      return safeSendMessage(msg.chat.id, "❌ Your account is not verified. Use /verify to link your Goated.com account.");
    }

    await safeSendMessage(msg.chat.id, MESSAGES.status(user[0]), { parse_mode: "Markdown" });
  } catch (error) {
    if (error instanceof Error) {
      log(`Error in status command: ${error.message}`);
      await safeSendMessage(msg.chat.id, "❌ Error checking status. Please try again later.");
    }
  }
}

async function safeSendMessage(chatId: number, text: string, options: any = {}) {
  if (!botInstance) return;

  try {
    await botInstance.sendMessage(chatId, text, options);
  } catch (error) {
    if (error instanceof Error) {
      log(`Failed to send message to ${chatId}: ${error.message}`);
    }
  }
}

function startHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  healthCheckInterval = setInterval(async () => {
    if (!botInstance) return;

    try {
      await botInstance.getMe();
      log("✅ Bot health check passed");
    } catch (error) {
      if (error instanceof Error) {
        log(`❌ Bot health check failed: ${error.message}`);
      }
      await initializeBot();
    }
  }, 60000);
}


let botInstance: TelegramBot | null = null;
let healthCheckInterval: NodeJS.Timer | null = null;

export {
  initializeBot,
  botInstance as bot,
  safeSendMessage,
};