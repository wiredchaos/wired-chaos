import { SlashCommandBuilder } from 'discord.js';
import { APP_BASE_URL } from '../config.js';
import { getReply } from '../agents/router.js';
import type { Command } from '../types.js';

const validGenerations = ['Boomer', 'GenX', 'Millennial', 'GenZ', 'GenAlpha'] as const;

type Generation = (typeof validGenerations)[number];

async function sendEvent(gen: Generation, userId: string) {
  const res = await fetch(`${APP_BASE_URL}/api/swarm/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId: 'KIBA', eventType: 'set_gen', payload: { gen, userId } })
  });

  if (!res.ok) {
    throw new Error('Failed to notify control plane');
  }
}

const setGen: Command = {
  data: new SlashCommandBuilder()
    .setName('set-gen')
    .setDescription('Set your generation context')
    .addStringOption((option) =>
      option
        .setName('generation')
        .setDescription('Pick your generation')
        .setChoices(...validGenerations.map((label) => ({ name: label, value: label })))
        .setRequired(true)
    ),
  async execute(interaction) {
    const generation = interaction.options.getString('generation', true) as Generation;

    if (!validGenerations.includes(generation)) {
      await interaction.reply({ content: 'Invalid generation.', ephemeral: true });
      return;
    }

    if (!APP_BASE_URL) {
      await interaction.reply({ content: 'APP_BASE_URL missing; cannot notify control plane.', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    await sendEvent(generation, interaction.user.id);
    await interaction.editReply({ content: `Generation set to ${generation}. ${getReply('KIBA', 'combinedBegin')}` });
  }
};

export default setGen;
