require('dotenv').config()
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const TEAM_NAMES = ['😡 Red Team', '💙 Blue Team', '🤢 Green Team', '🍊 Orange Team', '🐦‍⬛ Black Team', '💜 Purple Team', '🌠 Yellow Team', '🌊 Aqua Team']
const VALORANT_AGENTS = {
  'Astra': '🌌',
  'Breach': '💥',
  'Brimstone': '🔥',
  'Chamber': '💼',
  'Clove': '🌿',
  'Cypher': '🕵️‍♂️',
  'Deadlock': '🧊',
  'Fade': '🌘',
  'Gekko': '🦎',
  'Harbor': '🌊',
  'Iso': '🧿',
  'Jett': '💨',
  'KAY/O': '🤖',
  'Killjoy': '🛠️',
  'Neon': '⚡',
  'Omen': '👻',
  'Phoenix': '🔥',
  'Raze': '💣',
  'Reyna': '👁️',
  'Sage': '💊',
  'Skye': '🦘',
  'Sova': '🏹',
  'Viper': '☠️',
  'Yoru': '🚪'
}
const VALORANT_MAPS = ['Ascent', 'Bind', 'Breeze', 'Haven', 'Icebox', 'Lotus', 'Sunset', 'Split']

const fs = require('fs')
const path = require('path')

const PALOLEADERBOARD = path.join(__dirname, 'palo-leaderboard.json')
const DUCK_LEADERBOARD_PATH = path.join(__dirname, 'duckrace-leaderboard.json')
const POKUS_LEADERBOARD_PATH = path.join(__dirname, 'pokus-leaderboard.json')

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

const loadPokusLeaderboard = () => {
  if (!fs.existsSync(POKUS_LEADERBOARD_PATH)) return {}
  const data = fs.readFileSync(POKUS_LEADERBOARD_PATH, 'utf-8')
  return JSON.parse(data)
}

const savePokusLeaderboard = (data) => {
  fs.writeFileSync(POKUS_LEADERBOARD_PATH, JSON.stringify(data, null, 2))
}

function generateWeightedFocus() {
  const roll = Math.random()

  if (roll < 0.6) return Math.floor(Math.random() * 50)        // 0–49 (60%)
  if (roll < 0.85) return Math.floor(Math.random() * 30) + 50  // 50–79 (25%)
  if (roll < 0.97) return Math.floor(Math.random() * 10) + 80  // 80–89 (12%)
  return Math.floor(Math.random() * 10) + 90                   // 90–99 (3%)
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

    new SlashCommandBuilder()
      .setName('pokus')
      .setDescription('See how focused you are.'),

    new SlashCommandBuilder()
      .setName('pokusleaderboard')
      .setDescription('See the top 10 highest Pokus.'),

    new SlashCommandBuilder()
      .setName('generateagents')
      .setDescription('Randomly pick 5 Valorant agents.')

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

  if (interaction.commandName === 'pokus') {
    const user = interaction.user
    const focusPercent = generateWeightedFocus()

    const leaderboard = loadPokusLeaderboard()

    const prevBest = leaderboard[user.id]

    if (prevBest === undefined || focusPercent > prevBest) {
      leaderboard[user.id] = focusPercent
      savePokusLeaderboard(leaderboard)
    }

    await interaction.reply({
      content: `🧘 **${user.username}** is pokusing...\n🎯 Focus Meter: **${focusPercent}%**`,
      files: [
        'https://cdn.discordapp.com/attachments/929627310624219167/1394580661834092564/pokus.jpg?ex=687753f3&is=68760273&hm=3b10320f79ba24572bf4080e963a13dec0422bbb06f991e2517328b818d97834&'
      ]
    })
  }

  if (interaction.commandName === 'pokusleaderboard') {
    const leaderboard = loadPokusLeaderboard()
    const entries = Object.entries(leaderboard)

    if (entries.length === 0) {
      return interaction.reply('📉 No pokus data yet!')
    }

    const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 10)
    const medals = ['🥇', '🥈', '🥉']

    const lines = await Promise.all(
      sorted.map(async ([userId, score], index) => {
        const medal = medals[index] || `#${index + 1}`
        const user = await client.users.fetch(userId).catch(() => null)
        const name = user?.username || `Unknown (${userId})`

        return `${medal} **${name}**\n  🎯 Highest Focus: **${score}%**`
      })
    )

    await interaction.reply({
      content: `🧘‍♂️ **Top Pokus Masters** 🎯\n\n${lines.join('\n\n')}`
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
        return `${medal} **${name}**\n  👋 ${count} palo${count === 1 ? '' : 's'}`
      })
    )

    await interaction.reply({
      content: `👋 **Top Palo Masters** 🔥\n\n${output.join('\n\n')}`
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

  if (interaction.commandName === 'generateagents') {
    const shuffled = Object.entries(VALORANT_AGENTS).sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, 5)

    const formatted = picked.map(([name, emoji]) => `- ${emoji} ${name}`)

    await interaction.reply({
      content: `👀 **Random Valorant Agents:**\n${formatted.join('\n')}`
  })
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
      content: `🦆 A duck race is starting! Click **Join Race** to enter.\n👤 0 players joined!\n⏳ Starting automatically in **${joinTime / 1000} seconds**...`,
      components: [row],
      fetchReply: true
    })

    const collector = message.createMessageComponentCollector({ time: joinTime })

    collector.on('collect', async (btn) => {
      if (btn.customId === 'join_race') {
        if (!participants.has(btn.user.id)) {
          participants.set(btn.user.id, btn.user.username)

          const joinedCount = participants.size
          await message.edit({
            content: `🦆 A duck race is starting! Click **Join Race** to enter.\n👤 ${joinedCount} player${joinedCount > 1 ? 's' : ''} joined!\n⏳ Starting automatically in **${joinTime / 1000} seconds**...`,
            components: [row]
          })

          await btn.reply({ content: `✅ You're in!`, ephemeral: true })
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

      // 🧠 Save stats
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
    return interaction.reply('📉 No duck races yet!')
  }

  const sorted = Object.entries(duckLB)
    .sort(([, a], [, b]) => b.gold - a.gold || b.silver - a.silver || b.wins - a.wins)
    .slice(0, 10)

  const output = await Promise.all(
    sorted.map(async ([userId, stats], i) => {
      const medal = ['🥇', '🥈', '🥉'][i] || `#${i + 1}`
      const user = await client.users.fetch(userId).catch(() => null)
      const name = user?.username || `Unknown (${userId})`

      // Format line with padded columns
      return `${medal} **${name}**\n  🥇 ${stats.gold}  🥈 ${stats.silver}  🥉 ${stats.bronze}  🏁 ${stats.wins} win${stats.wins === 1 ? '' : 's'}`
    })
  )

  await interaction.reply({
    content: `🏁 **Top Duck Racers** 🦆\n\n${output.join('\n\n')}`
  })
}

})

client.login(process.env.DISCORD_TOKEN)