import { SlashCommandBuilder } from 'discord.js';
import { APP_BASE_URL } from '../config.js';
import { getReply } from '../agents/router.js';
import type { Command } from '../types.js';

async function sendEvent(enabled: boolean, userId: string) {
  const res = await fetch(`${APP_BASE_URL}/api/swarm/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'KIBA', eventType: 'set_neuro', payload: { enabled, userId } })
  });

  if (!res.ok) {
    throw new Error('Failed to notify control plane');
  }
}

const setNeuro: Command = {
  data: new SlashCommandBuilder()
    .setName('set-neuro')
    .setDescription('Toggle neurodivergent-friendly mode')
    .addBooleanOption((option) => option.setName('enabled').setDescription('Enable neuro-friendly UX').setRequired(true)),
  async execute(interaction) {
    const enabled = interaction.options.getBoolean('enabled', true);

    if (!APP_BASE_URL) {
      await interaction.reply({ content: 'APP_BASE_URL missing; cannot notify control plane.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    await sendEvent(enabled, interaction.user.id);
    await interaction.editReply({
      content: enabled
        ? 'Neuro-friendly mode enabled. You are seen and supported.'
        : 'Neuro-friendly mode disabled. Standard filters restored.'
    });
  }
};

export default setNeuro;
