export default async function handlePP(interaction) {
  await interaction.deferReply();

  const target = interaction.options.getUser('user') || interaction.user;
  const size = Math.floor(Math.random() * 15) + 1; // 1 to 15
  const pp = '8' + '='.repeat(size) + 'D';

  await interaction.editReply({
    content: `🍆 ${target.username}'s pp size: \`${pp}\``,
  });
}
