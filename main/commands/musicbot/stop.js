import { distube } from '../../index.js';

export default async function handleStop(interaction) {
  const queue = distube.getQueue(interaction.guildId);

  if (!queue) {
    return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
  }

  await queue.stop();
  await interaction.reply('⏹️ Stopped the music and cleared the queue.');
}
