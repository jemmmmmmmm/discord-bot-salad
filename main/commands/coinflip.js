
export default async function handleCoinFlip(interaction) {
  await interaction.deferReply();

  await new Promise((res) => setTimeout(res, 1500));

  const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
  await interaction.editReply(result);
}
