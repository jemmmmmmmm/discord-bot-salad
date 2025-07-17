import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getWeightedDuckStep } from '../utils/index.js';

const generateComment = (placement, index, total) => {
  const first = [
    'blasted through the water like a missile 💥',
    'quacked past the speed of sound 🦆💨',
    'activated feather boost mode 🧨',
    'set the pond on fire 🔥',
    'won before the others even started 🕶️',
    'splashed their way to fame 🌊🏆',
    'hacked the matrix mid-race 💻🦆',
    'water? what water? it just flew! 🚫🌊',
    'left behind a vapor trail 💫',
    'was already dry by the time others finished ☀️',
    'made the ducks union jealous 😤',
    'just blinked and crossed the finish line 👁️➡️',
    'finished with zero effort 😎',
    'had jet engines under its wings 🛫',
    'speed-ran duck life percent 🧠',
  ];
  const middle = [
    'flapped with purpose, but not urgency 🦆📦',
    'took a detour through snack town 🍪',
    'maintained medium duck velocity 💼',
    'quacked motivational quotes mid-race 📣',
    'was calculating optimal splash angles 📐',
    'just happy to be here 😊',
    'vibed more than raced 🎧',
    'swam with swagger 🕺',
    'paused to take selfies 📸',
    'it lost one of its foot...... RIP DUCKY',
    'called mom during the race ☎️',
    'almost remembered the strategy 🤔',
    'wore tiny goggles for style 😎',
    'got water in its feathers but pushed through 💧',
    'took the long way around on purpose 🗺️',
    'had an existential crisis mid-paddle 🌌',
  ];
  const last = [
    'forgot it was a race 💤',
    'swam in reverse to assert dominance 🔙',
    'was looking for the bathroom 🚽',
    'took a nap on a lily pad 😴🌸',
    'started a podcast mid-race 🎙️',
    'was still tying its webbed shoes 👟',
    'followed a butterfly off-course 🦋',
    'stopped to ask for directions 🧭',
    'ducked into the snack stand instead 🍿',
    'forgot how to duck temporarily 🤷‍♂️',
    'took the scenic route via Narnia 🌲',
    'swam with one wing tied behind its back 🪽',
    'joined a different race halfway through 🛶',
    'no excuse na bobo 🤯',
    'brought a kayak and still lost 🚣',
  ];

  if (placement === 1) return first[Math.floor(Math.random() * first.length)];
  if (index === total - 1) return last[Math.floor(Math.random() * last.length)];
  return middle[Math.floor(Math.random() * middle.length)];
};

const renderDuckRace = (players, trackLength = 25) => {
  return (
    '🏁 **Duck Race! First to the pond wins!** 🏁\n\n' +
    players
      .map(({ name, position }) => {
        const clamped = Math.max(0, trackLength - position);
        const pre = ' '.repeat(clamped);
        const post = '-'.repeat(position);
        return `🏁 ${pre}🦆 ${name} ${post}`;
      })
      .join('\n')
  );
};

export default async function handleDuckrace(interaction, { duckLB }) {
  const participants = new Map();
  let started = false;
  const joinTime = 60000;
  const raceLength = 40;

  await interaction.deferReply();
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('join_race')
      .setLabel('Join Race')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('force_start')
      .setLabel('Start Now')
      .setStyle(ButtonStyle.Success),
  );

  const message = await interaction.editReply({
    content: `🦆 A duck race is starting! Click **Join Race** to enter.\n👤 0 players joined!\n⏳ Starting automatically in **${
      joinTime / 1000
    } seconds**...`,
    components: [row],
    fetchReply: true,
  });

  const collector = message.createMessageComponentCollector({ time: joinTime });

  collector.on('collect', async (btn) => {
    if (btn.customId === 'join_race') {
      if (!participants.has(btn.user.id)) {
        participants.set(btn.user.id, btn.user.username);

        const joinedCount = participants.size;
        await message.edit({
          content: `🦆 A duck race is starting! Click **Join Race** to enter.\n👤 ${joinedCount} player${
            joinedCount > 1 ? 's' : ''
          } joined!\n⏳ Starting automatically in **${joinTime / 1000} seconds**...`,
          components: [row],
        });

        await btn.reply({ content: `✅ You're in!`, ephemeral: true });
      } else {
        await btn.reply({ content: `❗ You've already joined.`, ephemeral: true });
      }
    }

    if (btn.customId === 'force_start') {
      started = true;
      collector.stop();
    }
  });

  collector.on('end', async () => {
    if (participants.size < 2) {
      return interaction.editReply({
        content: '❌ Race cancelled. Not enough players joined.',
        components: [],
      });
    }

    const racers = [...participants.values()].map((name) => ({
      name,
      position: 0,
      elapsedTime: 0,
    }));
    await interaction.editReply({ content: `🎬 Race starting in 3...`, components: [] });
    await new Promise((r) => setTimeout(r, 1000));
    await interaction.editReply({ content: `🎬 Race starting in 2...` });
    await new Promise((r) => setTimeout(r, 1000));
    await interaction.editReply({ content: `🎬 Race starting in 1...` });
    await new Promise((r) => setTimeout(r, 1000));

    let raceMsg = await interaction.editReply({ content: renderDuckRace(racers, raceLength) });

    let finished = false;
    const results = [];

    const tickRate = 800;

    while (!finished) {
      for (const racer of racers) {
        if (racer.position >= raceLength) continue;

        const step = getWeightedDuckStep();
        racer.position += step;
        racer.elapsedTime += tickRate / 1000 + Math.random() * 0.25;

        if (racer.position >= raceLength) {
          racer.position = raceLength;
          results.push({
            name: racer.name,
            time: +racer.elapsedTime.toFixed(2),
          });
        }
      }

      await new Promise((r) => setTimeout(r, tickRate));
      await raceMsg.edit({ content: renderDuckRace(racers, raceLength) });

      if (results.length === racers.length) finished = true;
    }

    results.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      return a.name.localeCompare(b.name);
    });

    const firstTime = results[0].time;
    const currentGameLeaderboard = results.map((r, i) => ({
      ...r,
      place: i + 1,
      delta: (r.time - firstTime).toFixed(2),
    }));

    const formatted = currentGameLeaderboard
      .map((r, i) => {
        const medal = ['🥇', '🥈', '🥉'][i] || `${r.place}th`;
        const comment = generateComment(r.place, i, currentGameLeaderboard.length);
        return `${medal} **${r.name}** (${r.delta}s) — ${comment}`;
      })
      .join('\n');

    const leaderboard = duckLB.load();

    for (let i = 0; i < currentGameLeaderboard.length; i++) {
      const racer = currentGameLeaderboard[i];
      const user = [...participants.entries()].find(([_, name]) => name === racer.name);
      if (!user) continue;

      const [userId] = user;
      if (!leaderboard[userId]) {
        leaderboard[userId] = { gold: 0, silver: 0, bronze: 0, history: [] };
      }

      if (i === 0) leaderboard[userId].gold += 1;
      else if (i === 1) leaderboard[userId].silver += 1;
      else if (i === 2) leaderboard[userId].bronze += 1;

      leaderboard[userId].history.push(new Date().toISOString());
    }

    duckLB.save(leaderboard);

    await raceMsg.edit({ content: `🏆 **Duck Race Results** 🏆\n\n${formatted}` });
  });
}
