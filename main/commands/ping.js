export default async function handlePing(interaction) {
  const reply = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });

  const responseTime = reply.createdTimestamp - interaction.createdTimestamp;

  await interaction.editReply({
    content: `🏓 Pong!\n Interaction Latency: **${responseTime}ms**`,
  });
}
