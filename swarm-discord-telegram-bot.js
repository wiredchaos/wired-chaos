// swarm-discord-telegram-bot.js
// WIRED CHAOS SWARM Discord/Telegram Integration Bot
// Works in conjunction with RSS Bot, 589 Bot, and VRG33589
// NSA-level, modular, production-ready

const { Client, GatewayIntentBits, WebhookClient } = require('discord.js');
const TelegramBot = require('node-telegram-bot-api');

class SwarmDiscordTelegramBot {
  constructor(config = {}) {
    this.discordToken = process.env.DISCORD_BOT_TOKEN || config.discordToken;
    this.discordChannelId = process.env.DISCORD_CHANNEL_ID || config.discordChannelId;
    this.discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || config.discordWebhookUrl;
    this.telegramToken = process.env.TELEGRAM_BOT_TOKEN || config.telegramToken;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID || config.telegramChatId;

    // Discord setup
    this.discordClient = this.discordToken
      ? new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] })
      : null;
    this.discordWebhook = this.discordWebhookUrl ? new WebhookClient({ url: this.discordWebhookUrl }) : null;

    // Telegram setup
    this.telegramBot = this.telegramToken ? new TelegramBot(this.telegramToken, { polling: false }) : null;
  }

  async start() {
    if (this.discordClient && this.discordToken) {
      await this.discordClient.login(this.discordToken);
      this.discordClient.once('ready', () => {
        console.log('🤖 [SWARM-DISCORD] Bot is online.');
      });
    }
    if (this.telegramBot) {
      console.log('🤖 [SWARM-TELEGRAM] Bot is ready.');
    }
  }

  async sendDiscordMessage(message) {
    try {
      if (this.discordWebhook) {
        await this.discordWebhook.send(message);
      } else if (this.discordClient && this.discordChannelId) {
        const channel = await this.discordClient.channels.fetch(this.discordChannelId);
        await channel.send(message);
      } else {
        throw new Error('No Discord webhook or channel configured.');
      }
      console.log('✅ [SWARM-DISCORD] Message sent.');
    } catch (err) {
      console.error('❌ [SWARM-DISCORD] Error sending message:', err.message);
    }
  }

  async sendTelegramMessage(message) {
    try {
      if (this.telegramBot && this.telegramChatId) {
        await this.telegramBot.sendMessage(this.telegramChatId, message);
        console.log('✅ [SWARM-TELEGRAM] Message sent.');
      } else {
        throw new Error('No Telegram bot or chat ID configured.');
      }
    } catch (err) {
      console.error('❌ [SWARM-TELEGRAM] Error sending message:', err.message);
    }
  }

  // Extend with more automation as needed (e.g., create channels, manage roles)
}

module.exports = { SwarmDiscordTelegramBot };
