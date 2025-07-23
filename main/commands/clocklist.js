// commands/clocklist.js
import path from 'path';
import { fileURLToPath } from 'url';
import { createFsHandlers } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLOCK_DB = path.join(__dirname, '../../db/clockedInUsers.json');
const db = createFsHandlers(CLOCK_DB);

export default async function handleClockList(interaction) {
  await interaction.deferReply();

  const data = await db.load();
  const entries = [];

  for (const [userId, logs] of Object.entries(data)) {
    const lastSession = logs[logs.length - 1];
    if (lastSession && !lastSession.clockedOutAt) {
      const formattedTime = new Date(lastSession.clockedInAt).toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      });
      entries.push(`- **${lastSession.username}** — ${formattedTime}`);
    }
  }

  if (entries.length === 0) {
    return await interaction.editReply('🕒 No users are currently clocked in.');
  }

  const message = `🕒 **Clocked-In Users (${entries.length})**:\n\n${entries.join('\n')}`;
  await interaction.editReply(message);
}
