import dotenv from 'dotenv';

dotenv.config();

export const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ?? '';
export const APP_BASE_URL = process.env.APP_BASE_URL ?? '';
export const APP_ID = process.env.DISCORD_APP_ID ?? '';
export const GUILD_ID = process.env.DISCORD_GUILD_ID ?? '';

if (!BOT_TOKEN) {
  // eslint-disable-next-line no-console
  console.warn('DISCORD_BOT_TOKEN is missing. Commands will not start without it.');
}
