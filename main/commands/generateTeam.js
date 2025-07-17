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
    new ButtonBuilder()
      .setCustomId('show_kick_menu')
      .setLabel('Kick Players')
      .setStyle(ButtonStyle.Secondary),
  );

  const message = await interaction.editReply({
    content: `🎮 **Team Generator Started**\nPlayers can click **Join Game** to participate.\nOnly <@${hostId}> can generate or cancel the game.`,
    components: [row],
    fetchReply: true,
  });

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 30 * 60 * 1000,
  });

  const updateJoinedList = async () => {
    const joinedNames =
      [...participants.values()].map((name) => `👤 ${name}`).join('\n') || '_No one yet_';
    await message.edit({
      content: `🎮 **Team Generator Started**\nPlayers can click **Join Game** to participate.\nOnly <@${hostId}> can generate or cancel the game.\n\n**Joined Players:**\n${joinedNames}`,
      components: [row],
    });
  };

  collector.on('collect', async (btn) => {
    // JOIN GAME
    if (btn.customId === 'join_team') {
      if (!participants.has(btn.user.id)) {
        participants.set(btn.user.id, btn.user.username);
        await btn.reply({
          content: `✅ You joined the game, ${btn.user.username}!`,
          ephemeral: true,
        });
        await updateJoinedList();
      } else {
        await btn.reply({ content: '❗ You already joined.', ephemeral: true });
      }
    }

    // SHOW KICK MENU
    if (btn.customId === 'show_kick_menu') {
      if (btn.user.id !== hostId) {
        return btn.reply({ content: '❌ Only the host can kick players.', ephemeral: true });
      }

      if (participants.size === 0) {
        return btn.reply({ content: '🚫 No players to kick.', ephemeral: true });
      }

      const kickRows = [];
      let currentRow = new ActionRowBuilder();

      for (const [id, name] of participants.entries()) {
        if (id === hostId) continue; // Don't allow kicking host
        if (currentRow.components.length === 5) {
          kickRows.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
        currentRow.addComponents(
          new ButtonBuilder()
            .setCustomId(`kick_${id}`)
            .setLabel(`Kick ${name}`)
            .setStyle(ButtonStyle.Danger),
        );
      }
      if (currentRow.components.length > 0) kickRows.push(currentRow);

      await btn.reply({
        content: '👟 Select a player to kick:',
        components: kickRows,
        ephemeral: true,
      });

      const kickCollector = btn.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000, // 5 minutes
        filter: (i) => i.customId.startsWith('kick_') && i.user.id === hostId,
      });

      kickCollector.on('collect', async (kickBtn) => {
        if (!kickBtn.customId.startsWith('kick_')) return;
        if (kickBtn.user.id !== hostId) {
          return await kickBtn.reply({
            content: '❌ Only the host can kick players.',
            ephemeral: true,
          });
        }

        const kickedId = kickBtn.customId.replace('kick_', '');
        const kickedName = participants.get(kickedId);

        if (!kickedName) {
          return await kickBtn.reply({ content: '⚠️ Player not found.', ephemeral: true });
        }

        participants.delete(kickedId);
        await kickBtn.reply({ content: `✅ Kicked **${kickedName}**.`, ephemeral: true });
        await updateJoinedList();
      });
    }

    // GENERATE TEAMS
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
          content: `❌ Cannot create **${numTeams} teams** with only **${players.length} players**.`,
          components: [],
        });
      }

      const shuffled = players.sort(() => Math.random() - 0.5);
      const teams = Array.from({ length: numTeams }, () => []);

      await message.edit({
        content: `🎲 **Drafting teams...**\n_(This will only take a few seconds...)_`,
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

        await message.edit({ content: `🎲 **Drafting teams...**\n\n${preview}` });
        await new Promise((r) => setTimeout(r, 1500));
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

    // CANCEL
    if (btn.customId === 'cancel_game') {
      if (btn.user.id !== hostId) {
        return btn.reply({ content: '❌ Only the host can cancel the game.', ephemeral: true });
      }

      collector.stop();
      await message.edit({
        content: '❌ **Team Generator Cancelled by the Host.**',
        components: [],
      });
    }
  });

  // collector.on('end', async (_, reason) => {
  //   if (message.editable && reason !== 'messageDelete') {
  //     await message
  //       .edit({
  //         content:
  //           '⏰ **Team Generator expired after 30 minutes.**\nThe session has been auto-cancelled.',
  //         components: [],
  //       })
  //       .catch(() => null);
  //   }
  // });
}
