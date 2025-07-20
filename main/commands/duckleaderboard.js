export default async function handleDuckleaderboard(interaction, { duckLB, client }) {
  try {
    await interaction.deferReply();
    const leaderboard = duckLB.load();

    if (!Object.keys(leaderboard).length) {
      return interaction.editReply('📉 No duck races yet!');
    }

    const sorted = Object.entries(leaderboard)
      .sort(([, a], [, b]) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze)
      .slice(0, 10);

    const medals = ['🥇', '🥈', '🥉'];

    const rows = await Promise.all(
      sorted.map(async ([userId, stats], i) => {
        const user = await client.users.fetch(userId).catch(() => null);
        const name = (user?.username || 'Unknown').padEnd(16);
        const gold = String(stats.gold || 0).padStart(2);
        const silver = String(stats.silver || 0).padStart(2);
        const bronze = String(stats.bronze || 0).padStart(2);
        const rank = (medals[i] || ` ${i + 1}.`).padEnd(4);
        return `${rank} ${name} 🥇 ${gold}  🥈 ${silver}  🥉 ${bronze}`;
      }),
    );

    await interaction.editReply({
      content:
        '```\n🏁 Top Duck Racers 🦆\n\nRank Name             🥇  🥈  🥉\n──────────────────────────────────────────────\n' +
        rows.join('\n') +
        '\n```',
    });
  } catch (err) {
    console.error(err);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: '❌ Error while loading the leaderboard.',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: '❌ Error while loading the leaderboard.',
        ephemeral: true,
      });
    }
  }
}
