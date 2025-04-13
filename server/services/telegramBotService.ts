
import { Telegraf } from 'telegraf';
import { db } from '@db';
import { users, telegramUsers } from '@db/schema';
import { eq } from 'drizzle-orm';

class TelegramBotService {
  private bot: Telegraf;

  constructor() {
    this.bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');
    this.initializeCommands();
  }

  private initializeCommands() {
    this.bot.command('start', async (ctx) => {
      const telegramId = ctx.from.id.toString();
      
      try {
        const existingUser = await db.query.telegramUsers.findFirst({
          where: eq(telegramUsers.telegramId, telegramId)
        });

        if (!existingUser) {
          await db.insert(telegramUsers).values({
            telegramId,
            telegramUsername: ctx.from.username,
            isVerified: false
          });
        }

        ctx.reply('Welcome to GoatedVIPs! Use /verify to link your account.');
      } catch (error) {
        console.error('Error in start command:', error);
        ctx.reply('An error occurred. Please try again later.');
      }
    });

    this.bot.command('verify', (ctx) => {
      ctx.reply('Please visit goatedvips.gg/verify to complete verification.');
    });
  }

  public startBot() {
    this.bot.launch();
    console.log('Telegram bot started');
  }
}

export const telegramBotService = new TelegramBotService();
