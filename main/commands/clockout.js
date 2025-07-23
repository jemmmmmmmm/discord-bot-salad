// commands/clockout.js
import path from 'path';
import { fileURLToPath } from 'url';
import { createFsHandlers } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLOCK_DB = path.join(__dirname, '../../db/clockedInUsers.json');
const db = createFsHandlers(CLOCK_DB);

export default async function handleClockOut(interaction) {
  await interaction.deferReply({ ephemeral: true });

  const userId = interaction.user.id;
  const data = await db.load();
  const userLogs = data[userId] || [];
  const lastSession = userLogs[userLogs.length - 1];

  if (!lastSession || lastSession.clockedOutAt) {
    return await interaction.editReply('❗ You are not currently clocked in.');
  }

  const clockInTime = new Date(lastSession.clockedInAt);
  const now = new Date();
  lastSession.clockedOutAt = now.toISOString();
  await db.save(data);

  const durationMs = now - clockInTime;
  const mins = Math.floor(durationMs / 60000);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  const durationText = hours > 0 ? `${hours}h ${remainingMins}m` : `${remainingMins}m`;

  await interaction.editReply(`⏰ You clocked out after **${durationText}**.`);
}
