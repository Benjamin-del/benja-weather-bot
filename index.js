const stlist = require("./stations.json")
const { MessageEmbed } = require('discord.js');
const { Client, Intents } = require("discord.js");
const txml = require("txml");
const axios = require('axios').default;
const logo = "https://weather.benja.ml/photos/icon-white.png"

const theme = {
	logo: "https://weather.benja.ml/photos/icon-white.png",
	errror: "#FF0000",
	main: "#FF7700",
}
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.on("ready", () => {
  console.log("Server Booted...");
	console.log("Fetching stations List")
	client.user.setPresence({ activities: [{ name: 'with Canadian weather' }] });
});
function error(message) {
	const error_embed = new MessageEmbed()
		.setColor(theme.main)
		.setTitle('Error')
		.setAuthor({ name: 'Benja Weather', iconURL: 'https://weather.benja.ml/photos/icon.png', url: 'https://weather.benja.ml' })
		.setDescription("Error With Getting your weather Sorry!")
		.setTimestamp()
		.setFooter({ text: 'Powered By Benja Weather'});
	message.channel.send({ embeds: [error_embed] });
}
client.on("messageCreate", (message) => {
  if (message.content.startsWith("!s")) {
		const results = []
		const list = stlist.features
			message.channel.send("Searching...")
		  for (let i = 0; i < list.length; i++) {
				const msg = message.toString().split(" ")[1]
				if (list[i].properties["English Names"].toUpperCase().includes(msg.toUpperCase()) && msg.length > 2) {
					results.push(list[i].properties)
				}
			}
		var resname = "results"

		if (results.length === 1) {
			resname = "result"
		}
		message.channel.send("I have found " + results.length + " " + resname)
		 for (let i = 0; i < results.length; i++) {
		 		const result_embed = new MessageEmbed()
					.setColor(theme.main)
					.setTitle('Search Result')
					.setURL("https://weather.benja.ml/forcast/?id=" + results[i].Codes)
					.setAuthor({ name: 'Benja Weather', iconURL: logo, url: 'https://weather.benja.ml' })
					.setDescription('To Check Weather @ ' + fixNames(results[i]["English Names"]) + " send !w " + results[i].Codes)
					.setTimestamp()
					.setFooter({ text: 'Powered By Benja Weather'});
		 		message.channel.send({ embeds: [result_embed] });
		 }
  } else if (message.content.startsWith("!w")) {
		const method = message.toString().split(" ")[1]
		const code = message.toString().split(" ")[2]

		if (method === "c") {
			current(code,message)
		} else if (method === "d") {
			daily(code,message)
		} else if (method === "h"){
			hourly(code,message)
		} else if (method === "a") {
			current(code,message)
			daily(code,message)
			hourly(code,message)
		}
	}
});

function current(code,message) {
		axios.get('https://dd.weather.gc.ca/citypage_weather/xml/ON/' + code + "_e.xml")
  		.then(function (response) {
    	// handle success
				//console.log(response.data)
				const formated = (txml.simplify(txml.parse(response.data)).siteData)
				const current = formated.currentConditions
				
				const currentembed = {
					color: theme.main,
					title: 'Curent Conditions @ ' + current.station,
					url: logo,
					author: {
						name: 'Benja Weather',
						icon_url: checkIcon(current.iconCode),
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					description: current.condition + " | " + current.temperature + '°C',
					thumbnail: {
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					fields: [
		{
			name: 'Wind',
			value: current.wind.speed + " KM/H " + current.wind.direction + " (" + current.wind.bearing + "°)",
			inline: true,
		},
		{
			name: 'Humidex',
			value: current.humidex,
			inline: true,
		},
		{
			name: 'Humidity',
			value: current.relativeHumidity + "%",
			inline: true,
		},
		{
			name: 'Pressure',
			value: current.pressure + " kPa",
			inline: true,
		},
		{
			name: 'Visibility',
			value: current.visibility + " KM",
			inline: true,
		},
		{
			name: 'Dew point',
			value: current.dewpoint + "°C",
			inline: true,
		}
	
	],
	timestamp: new Date(),
	footer: {
		text: 'Powered by Benja Weather',
		icon_url: logo,
	},
	
};

message.channel.send({ embeds: [currentembed] });
			})
  		.catch(function (err) {
    	// handle error
			error(message)
    	console.log(err);
  	})
}
function daily(code,message) {
		axios.get('https://dd.weather.gc.ca/citypage_weather/xml/ON/' + code + "_e.xml")
  		.then(function (response) {
    	// handle success
				//console.log(response.data)
				const formated = (txml.simplify(txml.parse(response.data)).siteData)
				const days = formated.forecastGroup.forecast
				const ft = []
					for (let i = 0; i < days.length; i++) {
						const obj = {
							name: days[i].period,
							value: days[i].abbreviatedForecast.textSummary,
							inline: true
							}		
							ft.push(obj)
						}
				const perday_embed = {
					color: theme.main,
					title: 'Daily Conditions @ ' + formated.currentConditions.station,
					url: 'https://weather.benja.ml/forcast/?id=' + code,
					author: {
						name: 'Benja Weather',
						icon_url: checkIcon(formated.currentConditions.iconCode),
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					thumbnail: {
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					fields: ft,
					timestamp: new Date(),
					footer: {
					text: 'Powered by Benja Weather',
					icon_url: logo,
					},
				};
	
		message.channel.send({ embeds: [perday_embed] });
			})
  		.catch(function (err) {
    	// handle error
			error(message)
    	console.log(err);
  	})
}
// Hourly
function hourly(code,message) {
		axios.get('https://dd.weather.gc.ca/citypage_weather/xml/ON/' + code + "_e.xml")
  		.then(function (response) {
    	// handle success
				//console.log(response.data)
				const formated = (txml.simplify(txml.parse(response.data)).siteData)
				const hr = formated.hourlyForecastGroup.hourlyForecast
				const ft = []
					for (let i = 0; i < hr.length; i++) {
						const obj = {
							name: time(hr[i]._attributes.dateTimeUTC).hr,
							value: hr[i].condition,
							inline: true
							}		
							ft.push(obj)
						}
				const perday_embed = {
					color: theme.main,
					title: 'Hourly Conditions @ ' + formated.currentConditions.station,
					url: 'https://weather.benja.ml/forcast/?id=' + code,
					author: {
						name: 'Benja Weather',
						icon_url: checkIcon(formated.currentConditions.iconCode),
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					thumbnail: {
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					fields: ft,
					timestamp: new Date(),
					footer: {
					text: 'Powered by Benja Weather',
					icon_url: logo,
					},
				};
	
		message.channel.send({ embeds: [perday_embed] });
			})
  		.catch(function (err) {
    	// handle error
			error(message)
    	console.log(err);
  	})
}
function fixNames(data) {
	return data.replace(/Ã´/gi,"ô").replace(/Ã¨/gi,"è").replace(/Ã©/gi,"é").replace(/ÃŽ/gi,"Î").replace(/Ã/gi,"à")
}


function checkIcon(icon) {
	if (icon === "" || icon === undefined || icon === null) {
		return logo
	} else {
		return 'https://weather.gc.ca/weathericons/' + icon + ".gif"
	}
}

function time(time) {
	let [C,Y,M,D,H,m] = time.match(/\d\d/g);
	const tstring = new Date(Date.UTC(C+Y, M-1, D, H))

	var minutes = tstring.getMinutes()

	if (minutes < 10) {
		minutes  = minutes + "0"
	}
	return {
		hr: tstring.getHours() + ":" + minutes,
		all: tstring
	}
}
const discordkey = process.env['discordKey']
client.login(discordkey);