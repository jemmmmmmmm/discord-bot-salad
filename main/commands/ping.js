export default async function handlePing(interaction) {
  const now = Date.now();
  await interaction.deferReply();

  const latency = Date.now() - now;
  const apiLatency = interaction.client.ws.ping;

  await interaction.editReply({
    content: `🏓 Pong!\n🕒 Latency: **${latency}ms**\n📡 API Ping: **${apiLatency}ms**`,
  });
}
