const RESPONSES = [
  // Positive
  '🎯 It is certain.',
  '✅ Without a doubt.',
  '🌟 You may rely on it.',
  '🎉 Yes – definitely.',
  '👍 It is decidedly so.',
  '🙌 Signs point to yes.',

  // Neutral
  '🤔 Reply hazy, try again.',
  '🔮 Ask again later.',
  '🫥 Better not tell you now.',
  '💭 Cannot predict now.',
  '🌀 Concentrate and ask again.',

  // Negative
  '❌ Don’t count on it.',
  '🚫 My reply is no.',
  '😬 My sources say no.',
  '🙅 Outlook not so good.',
  '🥀 Very doubtful.',
];

export default async function handle8ball(interaction) {
  const question = interaction.options.getString('question');
  const answer = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];

  await interaction.reply({
    content: `🎱 **Question:** ${question}\n**Answer:** ${answer}`,
  });
}
