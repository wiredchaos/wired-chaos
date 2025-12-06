import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { APP_BASE_URL, BOT_TOKEN } from './config.js';
import { getReply } from './agents/router.js';
import { registerCommands } from './loadCommands.js';
import type { Command } from './types.js';
import begin from './commands/begin.js';
import setGen from './commands/setGen.js';
import setNeuro from './commands/setNeuro.js';
import setWallet from './commands/setWallet.js';
import npcMove from './commands/npcMove.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]
});

const commands: Command[] = [begin, setGen, setNeuro, setWallet, npcMove];
const commandMap = new Collection<string, Command>();
commands.forEach((command) => commandMap.set(command.data.name, command));

client.once(Events.ClientReady, async (readyClient) => {
  // eslint-disable-next-line no-console
  console.log(getReply('META_X', 'systemConfirm'));
  await registerCommands(commands);
  // eslint-disable-next-line no-console
  console.log(`Bot logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  // eslint-disable-next-line no-console
  console.log(`[MESSAGE:${message.author.username}] ${message.content}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = commandMap.get(interaction.commandName);

  if (!command) {
    await interaction.reply({ content: getReply('UPLINK', 'wrongChannel', { channel: '#control-plane' }), ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running command', error);
    const fallback = 'The swarm is momentarily unstable. Try again soon.';

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: fallback, ephemeral: true });
    } else {
      await interaction.reply({ content: fallback, ephemeral: true });
    }
  }
});

if (!BOT_TOKEN) {
  throw new Error('DISCORD_BOT_TOKEN is required.');
}

if (!APP_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('APP_BASE_URL is not set. API calls will fail until configured.');
}

client.login(BOT_TOKEN);
