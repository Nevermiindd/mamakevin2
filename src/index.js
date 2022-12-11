const config = require('dotenv')
const { Client, GatewayIntentBits, Routes, Collection } = require('discord.js')
const { REST } = require('@discordjs/rest')
const fetch = require('isomorphic-fetch')
const fs = require('node:fs')
const path = require('path')
const internal = require('node:stream')

config()

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

client.commands = new Collection()
const commands = []

const commandsPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(commandsPath)

const importFile = (filePath) => {
    const command = require(filePath)

    client.commands.set(command.data.name, command)
    commands.push(command.data.toJSON())

    console.log(`Loaded file ${command.data.name}.js`)
}

for(const folder of commandFolders) {

    let commandFiles

    const filePath = path.join(commandsPath, folder)

    try {
        commandFiles = fs.readdirSync(filePath)
    } catch (err) {
        importFile(filePath)
        continue
    }

    for(const file of commandFiles) {
        filePath = path.join(filePath, file)
        importFile(filePath)
    }

}

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const rest = new REST({ version: '10' }).setToken(TOKEN)

client.on('ready', async () => {
    console.log(`${client.user.tag} has logged in!`)
})

client.on('guildMemberAdd', async member => {
    await member.roles.add(process.env.JOIN_ROLE)
})

client.on('interactionCreate', async (interaction) => {
    if(interaction.isButton()) {

    }

    if(!interaction.isChatInputCommand) return

    const command = client.commands.get(interaction.commandName)

    if(!command) return

    try {
        await command.execute(client, interaction)
    } catch (err) {
        console.error(err)
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true
        })
    }

})

async function main() {

    try {
        console.log('Started refreshing application (/) commands.')
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: commands,
        })
        client.login(TOKEN)
    } catch (err) {}

}

main()