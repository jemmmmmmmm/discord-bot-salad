import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from '@discordjs/voice';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handleMisinput(interaction) {
  await interaction.deferReply();

  const channel = interaction.member.voice.channel;
  if (!channel) {
    return interaction.editReply('❌ You must be in a voice channel!');
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  const filePath = path.join(__dirname, '../../sounds/misinput.mp3');
  const resource = createAudioResource(filePath);
  const player = createAudioPlayer();

  player.play(resource);
  connection.subscribe(player);

  await new Promise((res) => setTimeout(res, 1000));
  await interaction.editReply('Playing...');

  player.on(AudioPlayerStatus.Idle, () => {
    connection.destroy();
  });
}
