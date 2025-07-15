import { generateWeightedFocus, getTitle } from '../utils/index.js';

const cooldowns = new Map();

export default async function handlePokus(interaction, { pokusLB }) {
  await interaction.deferReply();

  const user = interaction.user;
  const now = Date.now();
  const cooldownTime = 60 * 60 * 1000;
  const lastUsed = cooldowns.get(user.id);

  if (lastUsed && now - lastUsed < cooldownTime) {
    const remaining = Math.ceil((cooldownTime - (now - lastUsed)) / (60 * 1000));
    return interaction.editReply({
      content: `⏳ You can pokus again in **${remaining} minutes**.`,
      ephemeral: true,
    });
  }

  cooldowns.set(user.id, now);

  const focusPercent = generateWeightedFocus();
  const leaderboard = pokusLB.load();

  const prev = leaderboard[user.id] || {};
  if (prev.score === undefined || focusPercent > prev.score) {
    leaderboard[user.id] = {
      score: focusPercent,
      title: getTitle(focusPercent),
    };
    pokusLB.save(leaderboard);
  }

  await interaction.editReply({
    content: `🧘 **${user.username}** is pokusing...\n🎯 Focus Meter: **${focusPercent}%**`,
    files: [
      'https://cdn.discordapp.com/attachments/929627310624219167/1394580661834092564/pokus.jpg?ex=687753f3&is=68760273&hm=3b10320f79ba24572bf4080e963a13dec0422bbb06f991e2517328b818d97834&',
    ],
  });

  // 🎉 Broadcast if score is 90+
  if (focusPercent >= 90) {
    const channel = interaction.channel;
    const chance = focusPercent === 100 ? '0.025%' : '0.25%';
    const hype =
      focusPercent === 100
        ? `🤯 HOLYYYYYY SHIIIIIII— **${user.username}** just hit **100%** focus!!`
        : `🔥 **${user.username}** just hit **${focusPercent}%** with a **${chance}** chance!`;
    await channel.send(hype);
  }
}
