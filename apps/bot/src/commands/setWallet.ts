import { SlashCommandBuilder } from 'discord.js';
import { APP_BASE_URL } from '../config.js';
import type { Command } from '../types.js';

async function sendEvent(wallet: string, userId: string) {
  const res = await fetch(`${APP_BASE_URL}/api/swarm/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'KIBA', eventType: 'set_wallet', payload: { wallet, userId } })
  });

  if (!res.ok) {
    throw new Error('Failed to notify control plane');
  }
}

const setWallet: Command = {
  data: new SlashCommandBuilder()
    .setName('set-wallet')
    .setDescription('Bind your wallet for WL tracking')
    .addStringOption((option) => option.setName('wallet').setDescription('Wallet address').setRequired(true)),
  async execute(interaction) {
    const wallet = interaction.options.getString('wallet', true);

    if (!APP_BASE_URL) {
      await interaction.reply({ content: 'APP_BASE_URL missing; cannot notify control plane.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    await sendEvent(wallet, interaction.user.id);
    await interaction.editReply({ content: `Wallet bound to ${wallet}. WL deltas will follow this address.` });
  }
};

export default setWallet;
