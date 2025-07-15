export default async function handlePaloLeaderboard(interaction, { paloLB, client }) {
  await interaction.deferReply();
  const leaderboard = paloLB.load();

  if (!Object.keys(leaderboard).length) {
    return interaction.reply('📉 Wala pang napapalo... 😇');
  }

  const sorted = Object.entries(leaderboard)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const medals = ['🥇', '🥈', '🥉'];

  const header = `Rank  | Name               | 👋 Palo Count`;
  const divider = `------|--------------------|-----------`;

  const rows = await Promise.all(
    sorted.map(async ([userId, count], index) => {
      const medal = medals[index] || ` #${index + 1}`;
      const user = await client.users.fetch(userId).catch(() => null);
      const name = (user?.username || `Unknown`).padEnd(18, ' ');
      const palos = String(count).padStart(3, ' ') + ' palo';
      return `${medal} | ${name} | ${palos}`;
    }),
  );

  await interaction.editReply({
    content: `👋 **Top Palo Masters** 🔥\n\`\`\`\n${header}\n${divider}\n${rows.join(
      '\n',
    )}\n\`\`\``,
  });
}
