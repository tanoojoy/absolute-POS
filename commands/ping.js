const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with love!'),
	async execute(interaction) {
		await interaction.reply('Fuck you');
	},
};