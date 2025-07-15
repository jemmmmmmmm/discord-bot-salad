const VALORANT_AGENTS = {
  Astra: '🌌',
  Breach: '💥',
  Brimstone: '🔥',
  Chamber: '💼',
  Clove: '🌿',
  Cypher: '🕵️‍♂️',
  Deadlock: '🧊',
  Fade: '🌘',
  Gekko: '🦎',
  Harbor: '🌊',
  Iso: '🧿',
  Jett: '💨',
  'KAY/O': '🤖',
  Killjoy: '🛠️',
  Neon: '⚡',
  Omen: '👻',
  Phoenix: '🔥',
  Raze: '💣',
  Reyna: '👁️',
  Sage: '💊',
  Skye: '🦘',
  Sova: '🏹',
  Viper: '☠️',
  Yoru: '🚪',
  Waylay: '🛣️',
};
export default async function handleGenerateAgents(interaction) {
  await interaction.deferReply();

  const shuffled = Object.entries(VALORANT_AGENTS).sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 5);

  const formatted = picked.map(([name, emoji]) => `- ${emoji} ${name}`);

  await interaction.editReply({
    content: `👀 **Random Valorant Agents:**\n${formatted.join('\n')}`,
  });
}
