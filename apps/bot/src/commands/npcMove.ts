import { SlashCommandBuilder } from 'discord.js';
import { APP_BASE_URL } from '../config.js';
import { getReply } from '../agents/router.js';
import type { Command } from '../types.js';

type NpcMoveResponse = {
  narrative: string;
  wlDelta: number;
  project: 'VRG33589' | 'VAULT33';
};

async function sendNpcMove(prompt: string, userId: string): Promise<NpcMoveResponse> {
  const res = await fetch(`${APP_BASE_URL}/api/npc/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, platform: 'discord', prompt, source: 'discord_bot' })
  });

  if (!res.ok) {
    throw new Error('Failed to move NPC');
  }

  return (await res.json()) as NpcMoveResponse;
}

const npcMove: Command = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('Advance the NPC storyline')
    .addStringOption((option) => option.setName('prompt').setDescription('What do you do?').setRequired(true)),
  async execute(interaction) {
    const prompt = interaction.options.getString('prompt', true);

    if (!APP_BASE_URL) {
      await interaction.reply({ content: 'APP_BASE_URL missing; cannot call control plane.', ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const result = await sendNpcMove(prompt, interaction.user.id);

    await interaction.editReply(result.narrative);

    if (result.wlDelta > 0) {
      await interaction.followUp({
        content: getReply('GRYMM', 'wlEvent', { delta: result.wlDelta, project: result.project }),
        ephemeral: true
      });
    }
  }
};

export default npcMove;
