import { distube } from '../../index.js';

export default async function handleSkip(interaction) {
  const queue = distube.getQueue(interaction.guildId);

  if (!queue || !queue.playing) {
    return interaction.reply({ content: '❌ Nothing is playing right now.', ephemeral: true });
  }

  try {
    await queue.skip();

    const current = queue.songs[1];
    await interaction.reply(
      `⏭️ Skipped! \n Now playing: **${current.name}** by **${current.uploader.name}**`,
    );
  } catch (err) {
    await interaction.reply('❌ Unable to skip.');
  }
}
