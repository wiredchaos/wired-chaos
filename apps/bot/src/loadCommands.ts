import { REST, Routes } from 'discord.js';
import { APP_ID, BOT_TOKEN, GUILD_ID } from './config.js';
import type { Command } from './types.js';

export async function registerCommands(commands: Command[]) {
  if (!BOT_TOKEN || !APP_ID || !GUILD_ID) {
    // eslint-disable-next-line no-console
    console.warn('Skipping command registration: missing Discord credentials.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  const body = commands.map((command) => command.data.toJSON());

  // eslint-disable-next-line no-console
  console.log(`Registering ${body.length} slash commands to guild ${GUILD_ID}...`);
  await rest.put(Routes.applicationGuildCommands(APP_ID, GUILD_ID), { body });
  // eslint-disable-next-line no-console
  console.log('Slash commands synced.');
}
