import { distube } from '../../index.js';
import play from 'play-dl';
import Fuse from 'fuse.js';

export default async function handlePlay(interaction) {
  const query = interaction.options.getString('query');
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    return interaction.reply({
      content: '❌ You must be in a voice channel to use this command.',
      ephemeral: true,
    });
  }

  const isYouTubeUrl = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(query);
  if (isYouTubeUrl) {
    return interaction.reply({
      content: '❌ URL playback is not supported yet. Please enter a song name.',
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  try {
    const results = await play.search(query, { limit: 1 }).catch(() => []);

    if (!results.length) {
      return interaction.editReply(`❌ Couldn't find any results for **${query}**.`);
    }

    const fuse = new Fuse(results, {
      keys: ['title'],
      threshold: 0.4,
    });

    const [bestMatch] = fuse.search(query);
    const fallback = bestMatch?.item ?? results[0];

    await distube.play(voiceChannel, fallback.url, {
      textChannel: interaction.channel,
      member: interaction.member,
    });

    const queue = distube.getQueue(interaction.guildId);
    const title = fallback.title || query;

    if (queue && queue.playing && queue.songs.length > 1) {
      await interaction.editReply(`🎶 Queued: **${title}**`);
    } else {
      await interaction.editReply(`🎶 Now playing: **${title}**`);
    }
  } catch (err) {
    console.error(err);
    return interaction.editReply('❌ Something went wrong while trying to play the song.');
  }
}
