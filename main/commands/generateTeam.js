import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';

const TEAM_NAMES = [
  '😡 Red Team',
  '💙 Blue Team',
  '🤢 Green Team',
  '🍊 Orange Team',
  '🐦‍⬛ Black Team',
  '💜 Purple Team',
  '🌠 Yellow Team',
  '🌊 Aqua Team',
];

export default async function handleGenerateTeam(interaction) {
  await interaction.deferReply();

  const numTeams = interaction.options.getInteger('teams') || 2;
  const hostId = interaction.user.id;
  const participants = new Map();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('join_team')
      .setLabel('Join Game')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('generate_teams')
      .setLabel('Generate Teams')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId('cancel_game')
      .setLabel('Cancel Game')
      .setStyle(ButtonStyle.Danger),
  );

  const message = await interaction.editReply({
    content: `🎮 **Team Generator Started**\nPlayers can click **Join Game** to participate.\nOnly <@${hostId}> can generate or cancel the game.`,
    components: [row],
    fetchReply: true,
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 2 * 60 * 1000, // 2 minutes
  });

  collector.on('collect', async (btn) => {
    if (btn.customId === 'join_team') {
      if (!participants.has(btn.user.id)) {
        participants.set(btn.user.id, btn.user.username);

        await btn.reply({
          content: `✅ You joined the game, ${btn.user.username}!`,
          ephemeral: true,
        });

        const joinedNames =
          [...participants.values()].map((name) => `👤 ${name}`).join('\n') || '_No one yet_';

        await message.edit({
          content: `🎮 **Team Generator Started**\nPlayers can click **Join Game** to participate.\nOnly <@${hostId}> can generate or cancel the game.\n\n**Joined Players:**\n${joinedNames}`,
          components: [row],
        });
      } else {
        await btn.reply({ content: '❗ You already joined.', ephemeral: true });
      }
    }

    if (btn.customId === 'generate_teams') {
      if (btn.user.id !== hostId) {
        return btn.reply({
          content: '❌ Only the command invoker can generate teams.',
          ephemeral: true,
        });
      }

      collector.stop();

      const players = [...participants.values()];
      if (players.length < 2) {
        return message.edit({
          content: '❌ **Cancelled:** Not enough players to form teams.',
          components: [],
        });
      }

      if (numTeams > players.length) {
        return message.edit({
          content: `❌ Cannot create **${numTeams} teams** with only **${players.length} player${
            players.length === 1 ? '' : 's'
          }**.`,
          components: [],
        });
      }

      const shuffled = players.sort(() => Math.random() - 0.5);
      const teams = Array.from({ length: numTeams }, () => []);

      await message.edit({
        content: `🎲 **Drafting teams...**\n\n_(This will only take a few seconds...)_`,
        components: [],
      });

      for (let i = 0; i < shuffled.length; i++) {
        const player = shuffled[i];
        const teamIndex = i % numTeams;
        teams[teamIndex].push(player);

        const preview = teams
          .map((team, tIdx) => {
            const name = TEAM_NAMES[tIdx] || `Team ${tIdx + 1}`;
            const members = team.map((p) => `- ${p}`).join('\n') || '_No members yet_';
            return `**${name}**\n${members}`;
          })
          .join('\n\n');

        await message.edit({
          content: `🎲 **Drafting teams...**\n\u200B\n${preview}`,
        });
        await new Promise((r) => setTimeout(r, 800));
      }

      await message.edit({
        content: `✅ **Teams finalized!**\n\n${teams
          .map((team, i) => {
            const teamName = TEAM_NAMES[i] || `Team ${i + 1}`;
            return `**${teamName}**\n- ${team.join('\n- ')}`;
          })
          .join('\n\n')}`,
      });
    }

    if (btn.customId === 'cancel_game') {
      if (btn.user.id !== hostId) {
        return btn.reply({
          content: '❌ Only the command invoker can cancel the game.',
          ephemeral: true,
        });
      }

      collector.stop();
      await message.edit({
        content: '❌ **Team Generator Cancelled by the Host.**',
        components: [],
      });
    }
  });

  collector.on('end', async () => {
    if (message.editable) {
      await message.edit({ components: [] }).catch(() => null);
    }
  });
}
