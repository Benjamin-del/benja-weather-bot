const { MessageEmbed, Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');


console.log("Starting...")
// Helpers
// Comands
const search = require("./commands/search.js")
const woptions = require("./commands/options.js")
const wtypes = require("./commands/types.js")
// Static

//commands
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});


const config = {
	client: process.env['D_ID'],
	token: process.env['D_TOKEN']
}

const searchslash = new SlashCommandBuilder()
	.setName('search')
	.setDescription('Search Weather stations')
	.addStringOption(option =>
		option.setName('search')
			.setDescription('Search Weather stations')
			.setRequired(true));
	
	const commands = [searchslash]
		commands.map(commands => searchslash.toJSON())
	try {
	const rest = new REST({ version: '10' }).setToken(config.token);
	rest.put(Routes.applicationCommands(config.client), { body: commands })
		.then(() => console.log('INFO: INTERACTION COMMANDS REGISTERED'))

		
	} catch (err) {
		console.log(err)
	}


client.once('ready', () => {
	console.log('INFO: READY');
	console.log(`INFO: LOGGED ${client.user.tag}!`);
});
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;

		if (commandName === 'search') {
			const query = interaction.options.getString("search")
			searchCom(query,interaction)
		}
	} else if (interaction.isButton()) {
			const types = interaction.customId.split("-")[0]
			const code = interaction.customId.split("-")[2]

			console.log(interaction.customId)
		// Button Return 
			if (types === "btn") {
				// If Button is from weather return.
				console.log(interaction.customId)
				//btn-0-s0000430-ON-523
				const prov = interaction.customId.split("-")[3]
				wopt(code,interaction,prov)
			} else if (types === "opt") {
				//opt-mtd-code-rdn
				const method = interaction.customId.split("-")[1]
				const prov = interaction.customId.split("-")[3]
				
				if (method === "c") {
					interaction.reply("Curent Forcast:")
					const weather_c = await wtypes.current(code,prov)
					console.log(weather_c)
					const channel = client.channels.cache.get(interaction.channelId);
					channel.send(weather_c);
				} else if (method === "hr") {
					interaction.reply("Hourly Forcast:")
					const weather_h = await wtypes.hourly(code,prov)
					console.log(weather_h)
					const channel = client.channels.cache.get(interaction.channelId);
					channel.send(weather_h);	
				} else if (method === "7" || method === 7) {
					interaction.reply("7-day Forcast:")
					const weather_7 = await wtypes.daily(code,prov)
					console.log(weather_7)
					const channel = client.channels.cache.get(interaction.channelId);
					channel.send(weather_7);	
				}
			}
	}
});

async function searchCom(query,interaction) {
		const channel = client.channels.cache.get(interaction.channelId);
		await interaction.reply("Searching")
		const options = await search.helper(query)
		const scom = await search.command(options,interaction)
		
channel.send(scom);
}



async function wopt(code,interaction,prov) {
	const channel = client.channels.cache.get(interaction.channelId);
	await interaction.reply("Loading...")
	const wopt_res = await woptions.command(code,prov)
	await interaction.editReply("Chose An Option. You can always come back here to choose a new option")
	channel.send(wopt_res);
}

client.on("messageCreate", (message) => {
  if (message.content.startsWith("$update")) {
		message.reply("Connecting `" + message.guild.name + "` To Benja Weather")
		console.log("Deploy")
		deploy(message.guild.id,message)
	}
})

client.login(config.token);

process.on('uncaughtException', function (err) {
  console.error(err);
  console.log("Node NOT Exiting...");
});