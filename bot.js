console.log("BOT: STARTING")
const { MessageEmbed, Client, Intents, MessageActionRow, MessageButton } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const search = require("./commands/search.js")
const woptions = require("./commands/options.js")
const wtypes = require("./commands/types.js")
const fs = require('fs');
const web = require("./config/web.json")
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

const weatherslash = new SlashCommandBuilder()
	.setName('saved')
	.setDescription('Your Saved Stations.')

const commands = [searchslash, weatherslash]
commands.map(commands => searchslash.toJSON())
try {
	const rest = new REST({ version: '10' }).setToken(config.token);
	rest.put(Routes.applicationCommands(config.client), { body: commands })
		.then(() => console.log('INFO: INTERACTION COMMANDS REGISTERED'))

} catch (err) {
	console.log(err)
}


client.once('ready', () => {
	console.log('BOT: READY');
	console.log("BOT: LOGGED IN AS " + client.user.tag);
});
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const { commandName } = interaction;

		if (commandName === 'search') {
			const query = interaction.options.getString("search")
			searchCom(query, interaction)
		} else if (commandName === "saved") {
			const user = interaction.user.id
			savedcom(user, interaction)
		}
	} else if (interaction.isButton()) {
		const types = interaction.customId.split("-")[0]
		const code = interaction.customId.split("-")[2]

		console.log(interaction.customId)
		// Button Return 
		if (types === "btn") {
			// If Button is from weather return.
			//console.log(interaction.customId)
			//btn-0-s0000430-ON-523
			const prov = interaction.customId.split("-")[3]
			wopt(code, interaction, prov)
		} else if (types === "opt") {
			//opt-mtd-code-rdn
			const method = interaction.customId.split("-")[1]
			const prov = interaction.customId.split("-")[3]

			if (method === "c") {
				interaction.reply("Curent Forcast:")
				const weather_c = await wtypes.current(code, prov)
				//console.log(weather_c)
				const channel = client.channels.cache.get(interaction.channelId);
				channel.send(weather_c);
			} else if (method === "hr") {
				interaction.reply("Hourly Forcast:")
				const weather_h = await wtypes.hourly(code, prov)
				//console.log(weather_h)
				const channel = client.channels.cache.get(interaction.channelId);
				channel.send(weather_h);
			} else if (method === "7" || method === 7) {
				interaction.reply("7-day Forcast:")
				const weather_7 = await wtypes.daily(code, prov)
				//console.log(weather_7)
				const channel = client.channels.cache.get(interaction.channelId);
				channel.send(weather_7);
			}
		}
	}
});
async function savedcom(user, interaction) {
	const channel = client.channels.cache.get(interaction.channelId);

	const data = fs.readFileSync('config/users.json');
	const json = JSON.parse(data)
	const users = json.u

	for (let i = 0; i < users.length; i++) {
		const userarr = []
		if (users[i].user === user) {
			userarr.push(users[i].user)

			const ft = []
			const comp = []
			await interaction.reply({ content: 'Your saved Locations', ephemeral: true })
			const locs = users[i].locations
			for (let i = 0; i < locs.length; i++) {
				const feild = {
					name: locs[i].name + " `" + locs[i].prov + "`",
					value: "Select (" + (i + 1) + ") To select this location",
					inline: true
				}
				ft.push(feild)

				const component = {
					type: 2,
					label: "(" + (i + 1) + ") " + locs[i].name,
					style: 1,
					custom_id: "btn-" + i + "-" + locs[i].code + "-" + locs[i].prov + "-" + Math.floor(Math.random() * (1000 - 1) + 1)
				}
				comp.push(component)
			}

			const editloc = {
				type: 2,
				label: "Edit Saved Locations",
				style: 5,
				url: web.url
			}
			comp.push(editloc)
			const results = {
				color: "#FF7700",
				title: "Search Results",
				author: {
					name: 'Benja Weather',
					icon_url: "https://weather.benja.ml/photos/icon-white.png",
					url: 'https://weather.benja.ml/',
				},
				thumbnail: {
					url: "https://weather.benja.ml/photos/icon-white.png",
				},
				description: 'Your saved Locations!',

				fields: ft,
				timestamp: new Date(),
				footer: {
					text: 'Powered by Benja Weather',
					icon_url: "https://weather.benja.ml/photos/icon-white.png",
				},
			};
			await interaction.editReply({ embeds: [results], components: [{ "type": 1, "components": comp }], ephemeral: true })
			break;
		}
		if (userarr.length === 0) {
			await interaction.reply(
				{
					content: 'Whoops! No saved locations',
					components: [
						{
							type: 1,
							components: [
								{
									type: 2,
									label: "Add Locations",
									style: 5,
									url: web.url
								}
							]
						}
					],
					ephemeral: true
				}
			)
		}
	}
}
async function searchCom(query, interaction) {
	const channel = client.channels.cache.get(interaction.channelId);
	await interaction.reply("Searching")
	const options = await search.helper(query)
	const scom = await search.command(options, interaction)

	channel.send(scom);
}



async function wopt(code, interaction, prov) {
	const channel = client.channels.cache.get(interaction.channelId);
	await interaction.reply("Loading...")
	const wopt_res = await woptions.command(code, prov)
	await interaction.editReply("Chose An Option. You can always come back here to choose a new option")
	channel.send(wopt_res);
}

client.on("messageCreate", (message) => {
	if (message.content.startsWith("$update")) {
		message.reply("Connecting `" + message.guild.name + "` To Benja Weather")
		console.log("Deploy")
		deploy(message.guild.id, message)
	}
})

client.login(config.token);

process.on('uncaughtException', function(err) {
	console.log("BOT: ERROR");
	console.error(err);
});