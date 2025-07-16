export default async function handlePalo(interaction, { paloLB }) {
  const target = interaction.options.getUser('target');

  const leaderboard = paloLB.load();
  leaderboard[target.id] = (leaderboard[target.id] || 0) + 1;
  paloLB.save(leaderboard);

  await interaction.reply({
    content: `paluin si **${target.username}**! 👋`,
    files: [
      'https://cdn.discordapp.com/attachments/724279642806157439/1016906509382320168/XPBNYf6.gif?ex=687867fd&is=6877167d&hm=138e178ccbc721bf054d0990cd381b5548e4acedf25552e970f0720903466687&',
    ],
  });
}
