import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

const CHOICES = ['rock', 'paper', 'scissors'];
const EMOJIS = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

export default async function handleRps(interaction) {
  await interaction.deferReply({ ephemeral: false });

  const challenger = interaction.user;
  const opponent = interaction.options.getUser('opponent');

  if (opponent.bot) {
    return interaction.editReply('🤖 You can’t challenge a bot!');
  }
  if (challenger.id === opponent.id) {
    return interaction.editReply('🪞 You can’t challenge yourself!');
  }

  const choices = {};
  const buttons = CHOICES.map((choice) =>
    new ButtonBuilder()
      .setCustomId(choice)
      .setLabel(`${EMOJIS[choice]} ${choice}`)
      .setStyle(ButtonStyle.Secondary),
  );

  const row = new ActionRowBuilder().addComponents(buttons);

  const msg = await interaction.editReply({
    content: `🎮 **Rock Paper Scissors** — <@${challenger.id}> vs <@${opponent.id}>\nBoth players, click your choice!`,
    components: [row],
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30000,
  });

  collector.on('collect', async (btn) => {
    if (![challenger.id, opponent.id].includes(btn.user.id)) {
      return btn.reply({ content: '❌ You are not part of this game.', ephemeral: true });
    }

    if (choices[btn.user.id]) {
      return btn.reply({ content: '❗ You already picked.', ephemeral: true });
    }

    choices[btn.user.id] = btn.customId;
    await btn.reply({
      content: `✅ You picked **${btn.customId}** ${EMOJIS[btn.customId]}`,
      ephemeral: true,
    });

    if (choices[challenger.id] && choices[opponent.id]) {
      collector.stop();
    }
  });

  collector.on('end', async () => {
    if (!choices[challenger.id] || !choices[opponent.id]) {
      return msg.edit({
        content: `⏱️ Game canceled. One or both players didn’t choose in time.`,
        components: [],
      });
    }

    const c = choices[challenger.id];
    const o = choices[opponent.id];

    let result = '🤝 It’s a tie!';
    if (
      (c === 'rock' && o === 'scissors') ||
      (c === 'paper' && o === 'rock') ||
      (c === 'scissors' && o === 'paper')
    ) {
      result = `🎉 <@${challenger.id}> wins!`;
    } else if (c !== o) {
      result = `🎉 <@${opponent.id}> wins!`;
    }

    await msg.edit({
      content:
        `🎮 **Rock Paper Scissors** Results:\n\n` +
        `<@${challenger.id}> picked **${c}** ${EMOJIS[c]}\n` +
        `<@${opponent.id}> picked **${o}** ${EMOJIS[o]}\n\n${result}`,
      components: [],
    });
  });
}
