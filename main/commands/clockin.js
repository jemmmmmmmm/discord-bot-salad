import path from 'path';
import { fileURLToPath } from 'url';
import { createFsHandlers } from '../utils/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLOCK_DB = path.join(__dirname, '../../db/clockedInUsers.json');
const db = createFsHandlers(CLOCK_DB);

export default async function handleClockIn(interaction) {
  try {
    await interaction.deferReply({ ephemeral: true });

    const userId = interaction.user.id;
    const username = interaction.user.username;
    const data = await db.load();
    const userLogs = data[userId] || [];

    const lastSession = userLogs[userLogs.length - 1];
    if (lastSession && !lastSession.clockedOutAt) {
      return await interaction.editReply('You are already clocked in.');
    }

    const now = new Date().toISOString();
    userLogs.push({ username, clockedInAt: now });
    data[userId] = userLogs;
    await db.save(data);

    const formatted = new Date(now).toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila',
    });

    await interaction.editReply(`${username} clocked in at **${formatted}**.`);
  } catch (err) {
    console.error('⚠️ Clock-in failed:', err);
    if (!interaction.deferred && !interaction.replied) {
      await interaction.reply({ content: 'Something went wrong.', ephemeral: true });
    }
  }
}
