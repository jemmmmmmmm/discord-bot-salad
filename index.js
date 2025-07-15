require('dotenv').config()
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const TEAM_NAMES = ['😡 Red Team', '💙 Blue Team', '🤢 Green Team', '🍊 Orange Team', '🐦‍⬛ Black Team', '💜 Purple Team', '🌠 Yellow Team', '🌊 Aqua Team']
const VALORANT_MAPS = ['Ascent', 'Bind', 'Breeze', 'Haven', 'Icebox', 'Lotus', 'Sunset', 'Split']

const fs = require('fs')
const path = require('path')

const PALOLEADERBOARD = path.join(__dirname, 'palo-leaderboard.json')
const DUCK_LEADERBOARD_PATH = path.join(__dirname, 'duckrace-leaderboard.json')

// Helper to load the leaderboard
const paloLeaderBoard = () => {
  if (!fs.existsSync(PALOLEADERBOARD)) return {}
  const data = fs.readFileSync(PALOLEADERBOARD, 'utf-8')
  return JSON.parse(data)
}

// Helper to save the leaderboard
const savePaloLeaderBoard = (data) => {
  fs.writeFileSync(PALOLEADERBOARD, JSON.stringify(data, null, 2))
}


const loadDuckLeaderboard = () => {
  if (!fs.existsSync(DUCK_LEADERBOARD_PATH)) return {}
  const data = fs.readFileSync(DUCK_LEADERBOARD_PATH, 'utf-8')
  return JSON.parse(data)
}

const saveDuckLeaderboard = (data) => {
  fs.writeFileSync(DUCK_LEADERBOARD_PATH, JSON.stringify(data, null, 2))
}

const registerCommand = async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName('generateteam')
      .setDescription('Randomly split players into teams.')
      .addStringOption(option => option.setName('players').setDescription('List of names or @mentions (space/comma separated)').setRequired(true))
      .addIntegerOption(option => option.setName('teams').setDescription('Number of teams (default: 2)').setMinValue(2)),

    new SlashCommandBuilder()
      .setName('generatemappool')
      .setDescription('Randomly generate a Valorant map pool.')
      .addIntegerOption(option => option.setName('amount').setDescription('Number of maps to pick (default: 3)').setMinValue(1).setMaxValue(VALORANT_MAPS.length)),

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
  .addUserOption(option =>
    option.setName('target')
      .setDescription('Sino papaluin natin?')
      .setRequired(true)
  ),

  ].map(cmd => cmd.toJSON())

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

  try {
    console.log('📦 Registering slash commands...')
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands })
    console.log('✅ Commands registered.')
  } catch (err) {
    console.error('❌ Failed to register commands:', err)
  }
}

client.once('ready', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`)
  registerCommand()
})

const generateFunnyComment = (placement, index, total) => {
  const first = [
    'flew like a goose on Red Bull 🪽',
    'left everyone in the pond dust 💨',
    'crossed the finish like it owed them money 🤑'
  ]
  const middle = [
    'quacked with confidence 🦆',
    'drifted through lily pads 🍃',
    'lost a feather mid-race 🪶'
  ]
  const last = [
    'tripped on a worm 🍠',
    'got distracted by bread 🥖',
    'took a nap mid-race 😴',
    'is still looking for the starting line 🤔'
  ]

  if (placement === 1) return first[Math.floor(Math.random() * first.length)]
  if (index === total - 1) return last[Math.floor(Math.random() * last.length)]
  return middle[Math.floor(Math.random() * middle.length)]
}

const renderDuckRace = (players, trackLength = 25) => {
  return (
    '🏁 **Duck Race! First to the pond wins!** 🏁\n\n' +
    players
      .map(({ name, position }) => {
        const clamped = Math.max(0, trackLength - position)
        const pre = ' '.repeat(clamped)
        const post = '-'.repeat(position)
        return `🏁 ${pre}🦆 ${name} ${post}`
      })
      .join('\n')
  )
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  if (interaction.commandName === 'palo') {
    const target = interaction.options.getUser('target')

    const leaderboard = paloLeaderBoard()
    leaderboard[target.id] = (leaderboard[target.id] || 0) + 1
    savePaloLeaderBoard(leaderboard)

    await interaction.reply({
      content: `paluin si **${target.username}**! 👋`,
      files: ['https://cdn.discordapp.com/attachments/990946463204913152/992410372894097448/XPBNYf6.gif?ex=6876f5ee&is=6875a46e&hm=8b926b98e7e582233533ff177186043972098970d392696694bc02b6640fc7fc&']
    })
  }

  if (interaction.commandName === 'paloleaderboard') {
  const leaderboard = paloLeaderBoard()

  if (!Object.keys(leaderboard).length) {
    return interaction.reply('📉 Wala pang napapalo... 😇')
  }

  const sorted = Object.entries(leaderboard)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const output = await Promise.all(
    sorted.map(async ([userId, count], index) => {
      const user = await client.users.fetch(userId).catch(() => null)
      const medal = ['🥇', '🥈', '🥉'][index] || `#${index + 1}`
      const name = user?.username || `Unknown (${userId})`
      return `${medal} **${name}** — ${count} palo${count === 1 ? '' : 's'}`
    })
  )

  await interaction.reply({
    content: `🏆 **Palo Leaderboard** 🏆\n\n${output.join('\n')}`
  })
}

  if (interaction.commandName === 'generateteam') {
    const playersRaw = interaction.options.getString('players')
    const numTeams = interaction.options.getInteger('teams') || 2
    const rawList = playersRaw.split(/[\s,]+/).filter(Boolean)

    if (rawList.length < 2) {
      return interaction.reply({ content: '❌ Please provide at least 2 players.', ephemeral: true })
    }

    if (numTeams > rawList.length) {
      return interaction.reply({ content: `❌ Too many teams. You only have ${rawList.length} players.`, ephemeral: true })
    }

    const shuffled = rawList.sort(() => Math.random() - 0.5)
    const teams = Array.from({ length: numTeams }, () => [])
    shuffled.forEach((player, i) => teams[i % numTeams].push(player))
    const availableNames = [...TEAM_NAMES].sort(() => Math.random() - 0.5)

    const output = teams.map((team, i) => {
      const teamName = availableNames[i] || `Team ${i + 1}`
      return `**${teamName}**\n- ${team.join('\n- ')}`
    }).join('\n\n')

    await interaction.reply(output)
  }

  if (interaction.commandName === 'generatemappool') {
    const amount = interaction.options.getInteger('amount') || 3

    if (amount > VALORANT_MAPS.length) {
      return interaction.reply({ content: `❌ Max is ${VALORANT_MAPS.length} maps.`, ephemeral: true })
    }

    const shuffledMaps = [...VALORANT_MAPS].sort(() => Math.random() - 0.5)
    const selected = shuffledMaps.slice(0, amount)

    const output = `🗺️ **Map Pool (${amount} map${amount > 1 ? 's' : ''}):**\n- ${selected.join('\n- ')}`
    await interaction.reply(output)
  }

  if (interaction.commandName === 'duckrace') {
    const participants = new Map()
    let started = false
    const joinTime = 15000
    const raceLength = 25

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('join_race').setLabel('Join Race').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('force_start').setLabel('Start Now').setStyle(ButtonStyle.Success)
    )

    const message = await interaction.reply({
      content: `🦆 A duck race is starting! Click **Join Race** to enter.\n⏳ Starting automatically in **${joinTime / 1000} seconds**...`,
      components: [row],
      fetchReply: true
    })

    const collector = message.createMessageComponentCollector({ time: joinTime })

    collector.on('collect', async (btn) => {
      if (btn.customId === 'join_race') {
        if (!participants.has(btn.user.id)) {
          participants.set(btn.user.id, btn.user.username)
          await interaction.followUp({ content: `🦆 ${btn.user.username} has joined the race!`, ephemeral: false })
          await btn.reply({ content: `✅ You're in, ${btn.user.username}!`, ephemeral: true })
        } else {
          await btn.reply({ content: `❗ You've already joined.`, ephemeral: true })
        }
      }

      if (btn.customId === 'force_start') {
        started = true
        collector.stop()
      }
    })

    collector.on('end', async () => {
      if (participants.size < 2) {
        return interaction.editReply({ content: '❌ Race cancelled. Not enough players joined.', components: [] })
      }

      const racers = [...participants.values()].map(name => ({ name, position: 0 }))
      await interaction.editReply({ content: `🎬 Race starting in 3...`, components: [] })
      await new Promise(r => setTimeout(r, 1000))
      await interaction.editReply({ content: `🎬 Race starting in 2...` })
      await new Promise(r => setTimeout(r, 1000))
      await interaction.editReply({ content: `🎬 Race starting in 1...` })
      await new Promise(r => setTimeout(r, 1000))

      let raceMsg = await interaction.editReply({ content: renderDuckRace(racers, raceLength) })

      let finished = false
      const results = []

      while (!finished) {
        for (const racer of racers) {
          if (!results.find(r => r.name === racer.name)) {
            racer.position += Math.floor(Math.random() * 3) + 1
            if (racer.position >= raceLength) {
              racer.position = raceLength
              results.push({ name: racer.name, time: Date.now() })
            }
          }
        }

        await new Promise(r => setTimeout(r, 800))
        await raceMsg.edit({ content: renderDuckRace(racers, raceLength) })

        if (results.length === racers.length) finished = true
      }

      const firstTime = results[0].time
      const leaderboard = results.map((r, i) => ({
        ...r,
        place: i + 1,
        delta: ((r.time - firstTime) / 1000).toFixed(2)
      }))

      const formatted = leaderboard.map((r, i) => {
        const medal = ['🥇', '🥈', '🥉'][i] || `${r.place}th`
        const comment = generateFunnyComment(r.place, i, leaderboard.length)
        return `${medal} **${r.name}** (${r.delta}s) — ${comment}`
      }).join('\n')

     
      const duckLB = loadDuckLeaderboard()

      for (let i = 0; i < leaderboard.length; i++) {
        const racer = leaderboard[i]
        const user = [...participants.entries()].find(([_, name]) => name === racer.name)
        if (!user) continue

        const [userId] = user
        if (!duckLB[userId]) {
          duckLB[userId] = { wins: 0, gold: 0, silver: 0, bronze: 0, history: [] }
        }

        duckLB[userId].wins += i === 0 ? 1 : 0
        if (i === 0) duckLB[userId].gold += 1
        else if (i === 1) duckLB[userId].silver += 1
        else if (i === 2) duckLB[userId].bronze += 1

        duckLB[userId].history.push(new Date().toISOString())
      }

      saveDuckLeaderboard(duckLB)


      await raceMsg.edit({ content: `🏆 **Duck Race Results** 🏆\n\n${formatted}` })
    })
  }

  if (interaction.commandName === 'duckleaderboard') {
    const duckLB = loadDuckLeaderboard()

    if (!Object.keys(duckLB).length) {
      return interaction.reply('📉 No winners yet!')
    }

    const sorted = Object.entries(duckLB)
      .sort(([, a], [, b]) => b.gold - a.gold || b.silver - a.silver || b.wins - a.wins)
      .slice(0, 10)

    const output = await Promise.all(
      sorted.map(async ([userId, stats], i) => {
        const medal = ['🥇', '🥈', '🥉'][i] || `#${i + 1}`
        const user = await client.users.fetch(userId).catch(() => null)
        const name = user?.username || `Unknown (${userId})`
        return `${medal} **${name}** — 🥇 ${stats.gold} | 🥈 ${stats.silver} | 🥉 ${stats.bronze} | 🏁 ${stats.wins} win${stats.wins === 1 ? '' : 's'}`
      })
    )

    await interaction.reply({
      content: `🏁 **Top Duck Racers** 🏁\n\n${output.join('\n')}`
    })
  }
})

client.login(process.env.DISCORD_TOKEN)