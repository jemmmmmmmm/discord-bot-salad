import { EmbedBuilder } from 'discord.js';

export default async function handlePalo(interaction, { paloLB }) {
  const target = interaction.options.getUser('target');

  const leaderboard = paloLB.load();
  leaderboard[target.id] = (leaderboard[target.id] || 0) + 1;
  paloLB.save(leaderboard);

  const embed = new EmbedBuilder()
    .setDescription(`paluin si **${target.username}**! 👋`)
    .setImage('https://s14.gifyu.com/images/bKcLL.gif');

  await interaction.reply({ embeds: [embed] });
}
