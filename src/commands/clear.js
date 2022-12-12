const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Antwoord met Pong!')
        .addNumberOption(option =>
            option.setName("amount")
                .setRequired(true)
                .setDescription("Amount of messages to remove.")
                .setMinValue(0)),
    async execute(client, interaction) {
        const amountToRemove = interaction.options.getNumber("amount")

        await interaction.channel.bulkDelete(amountToRemove, true)

        await interaction.reply({ content: `Succesfully removed ${amountToRemove} messages!`,
            ephemeral: true })
    }
}