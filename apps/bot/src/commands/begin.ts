import { SlashCommandBuilder } from 'discord.js';
import { getReply } from '../agents/router.js';
import type { Command } from '../types.js';

const begin: Command = {
  data: new SlashCommandBuilder().setName('begin').setDescription('Begin the WIRED CHAOS onboarding ritual'),
  async execute(interaction) {
    const message = [
      getReply('KIBA', 'combinedBegin'),
      'Run /set-gen to lock your generation context.',
      'Use /set-neuro to toggle neurodivergent-friendly mode.',
      'Use /set-wallet to bind your address before WL delta accrues.',
      'Then head to the NPC channel and run /move to advance the storyline.'
    ].join('\n');

    await interaction.reply({ content: message, ephemeral: true });
  }
};

export default begin;
