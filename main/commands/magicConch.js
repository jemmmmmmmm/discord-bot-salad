const RESPONSES = [
  'Nothing.',
  'I don’t think so.',
  'Maybe someday.',
  'Neither.',
  'No.',
  'Yes.',
  'Try asking again.',
  'You should do... nothing.',
  'No.',
  'Ask again later.',
  'I don’t feel like it.',
  'Why don’t you ask again?',
  'That would be telling.',
  'You must wait.',
  'Better not.',
  'Mmm... no.',
  'Do nothing.',
];

export default async function handleMagicConch(interaction) {
  const question = interaction.options.getString('question');
  const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

  await interaction.reply({
    content: `🐚 **You ask:** ${question}\n**Magic Conch says:** ${answer}`,
  });
}
