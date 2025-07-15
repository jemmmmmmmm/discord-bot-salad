export default async function handlePokusLeaderboard(interaction, { pokusLB, client }) {
  const raw = pokusLB.load();
  const entries = Object.entries(raw);

  if (entries.length === 0) {
    return interaction.reply('📉 No pokus data yet!');
  }

  const sorted = entries
    .map(([id, data]) => [id, typeof data === 'object' ? data : { score: data }])
    .sort(([, a], [, b]) => b.score - a.score)
    .slice(0, 10);

  const medals = ['🥇', '🥈', '🥉'];
  const rows = await Promise.all(
    sorted.map(async ([userId, data], i) => {
      const user = await client.users.fetch(userId).catch(() => null);
      const name = (user?.username || `Unknown`).padEnd(16);
      const score = `${String(data.score || 0)}%`.padStart(4);
      const title = data.title ? ` 👑 ${data.title}` : '';
      return `${(medals[i] || ` ${i + 1}.`).padEnd(4)} ${name} ${score}${title}`;
    }),
  );

  await interaction.reply({
    content: `\`\`\`\n🏆 Top Pokus Masters\n\nRank Name             Focus Title\n────────────────────────────────────\n${rows.join(
      '\n',
    )}\n\`\`\``,
  });
}
