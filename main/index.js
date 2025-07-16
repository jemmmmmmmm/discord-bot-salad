import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import 'dotenv/config.js';

import path from 'path';
import { fileURLToPath } from 'url';
import handleDuckrace from './commands/duckrace.js';
import handleGenerateAgents from './commands/generateAgents.js';
import handleGenerateMapPool from './commands/generateMapPool.js';
import handleGenerateTeam from './commands/generateTeam.js';
import handlePalo from './commands/palo.js';
import handlePaloLeaderboard from './commands/paloleaderboard.js';
import handlePokus from './commands/pokus.js';
import handlePokusLeaderboard from './commands/pokusleaderboard.js';
import { createFsHandlers } from './utils/index.js';
import handleDuckleaderboard from './commands/duckleaderboard.js';
import handleCoinFlip from './commands/coinflip.js';
import handleMagicConch from './commands/magicConch.js';
import handlePing from './commands/ping.js';
import handleRps from './commands/rps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

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
};
const VALORANT_MAPS = ['Ascent', 'Bind', 'Breeze', 'Haven', 'Icebox', 'Lotus', 'Sunset', 'Split'];

const PALO_LEADERBOARD_PATH = path.join(__dirname, 'data', '../../db/palo-leaderboard.json');
const DUCK_LEADERBOARD_PATH = path.join(__dirname, 'data', '../../db/duckrace-leaderboard.json');
const POKUS_LEADERBOARD_PATH = path.join(__dirname, 'data', '../../db/pokus-leaderboard.json');
const paloLB = createFsHandlers(PALO_LEADERBOARD_PATH);
const duckLB = createFsHandlers(DUCK_LEADERBOARD_PATH);
const pokusLB = createFsHandlers(POKUS_LEADERBOARD_PATH);

// Debug logs
const LOGS = path.join(__dirname, 'data', '../../dev/logs.json');
const logsHandler = createFsHandlers(LOGS);

const registerCommand = async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName('generateteam')
      .setDescription('Randomly split players into teams.')
      .addStringOption((option) =>
        option
          .setName('players')
          .setDescription('Number of players joining (approx.)')
          .setRequired(true),
      )
      .addIntegerOption((option) =>
        option.setName('teams').setDescription('Number of teams (default: 2)').setMinValue(2),
      ),

    new SlashCommandBuilder()
      .setName('generatemappool')
      .setDescription('Randomly generate a Valorant map pool.')
      .addIntegerOption((option) =>
        option
          .setName('amount')
          .setDescription('Number of maps to pick (default: 3)')
          .setMinValue(1)
          .setMaxValue(VALORANT_MAPS.length),
      ),

    new SlashCommandBuilder()
      .setName('duckrace')
      .setDescription('Start a duck race and let players join!'),

    new SlashCommandBuilder()
      .setName('duckleaderboard')
      .setDescription('View the top 10 duck racers.'),

    new SlashCommandBuilder()
      .setName('paloleaderboard')
      .setDescription('View the top 10 most pinalo users.'),

    new SlashCommandBuilder()
      .setName('palo')
      .setDescription('Send a warm palo to someone!')
      .addUserOption((option) =>
        option.setName('target').setDescription('Sino papaluin natin?').setRequired(true),
      ),

    new SlashCommandBuilder().setName('pokus').setDescription('See how focused you are.'),

    new SlashCommandBuilder()
      .setName('pokusleaderboard')
      .setDescription('See the top 10 highest Pokus.'),

    new SlashCommandBuilder()
      .setName('generateagents')
      .setDescription('Randomly pick 5 Valorant agents.'),

    new SlashCommandBuilder()
      .setName('coinflip')
      .setDescription('Cant decide? Let fate decide for you.'),

    new SlashCommandBuilder()
      .setName('magicconch')
      .setDescription('Ask the Magic Conch Shell a question!')
      .addStringOption((option) =>
        option
          .setName('question')
          .setDescription('Your question for the Magic Conch Shell')
          .setRequired(true),
      ),

    new SlashCommandBuilder().setName('ping').setDescription('Check bot latency.'),

    new SlashCommandBuilder()
      .setName('rps')
      .setDescription('Challenge another user to Rock Paper Scissors!')
      .addUserOption((option) =>
        option.setName('opponent').setDescription('The user to challenge').setRequired(true),
      ),
  ].map((cmd) => cmd.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('📦 Registering slash commands...');
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log('✅ Commands registered.');
  } catch (err) {
    console.error('❌ Failed to register commands:', err);
  }
};

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
  registerCommand();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  console.log(interaction.commandName);

  const loadLogs = logsHandler.load();
  loadLogs[interaction.commandName] = (loadLogs[interaction.commandName] || 0) + 1;
  logsHandler.save(loadLogs);

  try {
    switch (interaction.commandName) {
      case 'palo':
        return await handlePalo(interaction, { paloLB });
      case 'paloleaderboard':
        return await handlePaloLeaderboard(interaction, { paloLB, client });
      case 'pokus':
        return await handlePokus(interaction, {
          pokusLB,
        });
      case 'pokusleaderboard':
        return await handlePokusLeaderboard(interaction, { pokusLB, client });
      case 'generateteam':
        return await handleGenerateTeam(interaction);
      case 'generateagents':
        return await handleGenerateAgents(interaction);
      case 'generatemappool':
        return await handleGenerateMapPool(interaction);
      case 'duckrace':
        return await handleDuckrace(interaction, { duckLB });
      case 'duckleaderboard':
        return await handleDuckleaderboard(interaction, { duckLB, client });
      case 'coinflip':
        return await handleCoinFlip(interaction);
      case 'magicconch':
        return await handleMagicConch(interaction);
      case 'ping':
        return await handlePing(interaction);
      case 'rps':
        return await handleRps(interaction);
    }
  } catch (err) {
    console.error(err);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Error while executing the command.',
        ephemeral: true,
      });
    } else {
      await interaction.followUp({
        content: '❌ Error while executing the command.',
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
