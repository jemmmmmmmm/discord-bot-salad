const VALORANT_MAPS = [
  'Abyss',
  'Ascent',
  'Bind',
  'Breeze',
  'Corrode',
  'Haven',
  'Icebox',
  'Lotus',
  'Sunset',
  'Split',
  'Fracture',
  'Pearl',
];

export default async function handleGenerateMapPool(interaction) {
  const amount = interaction.options.getInteger('amount') || 3;

  if (amount > VALORANT_MAPS.length) {
    return interaction.reply({
      content: `❌ Max is ${VALORANT_MAPS.length} maps.`,
      ephemeral: true,
    });
  }

  const shuffledMaps = [...VALORANT_MAPS].sort(() => Math.random() - 0.5);
  const selected = shuffledMaps.slice(0, amount);

  const output = `🗺️ **Map Pool (${amount} map${amount > 1 ? 's' : ''}):**\n- ${selected.join(
    '\n- ',
  )}`;
  await interaction.reply(output);
}
