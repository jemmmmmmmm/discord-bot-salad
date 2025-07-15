export default async function handlePalo(interaction, { paloLB }) {
  const target = interaction.options.getUser('target');

  const leaderboard = paloLB.load();
  leaderboard[target.id] = (leaderboard[target.id] || 0) + 1;
  paloLB.save(leaderboard);

  await interaction.reply({
    content: `paluin si **${target.username}**! 👋`,
    files: [
      'https://cdn.discordapp.com/attachments/990946463204913152/992410372894097448/XPBNYf6.gif?ex=6876f5ee&is=6875a46e&hm=8b926b98e7e582233533ff177186043972098970d392696694bc02b6640fc7fc&',
    ],
  });
}
