const axios = require('axios').default;
const txml = require('txml');
console.log("BOT: COMMAND TYPES LOADED")

module.exports = {
	current: async function(code,prov,interaction) {
			
			const response = await axios.get('https://dd.weather.gc.ca/citypage_weather/xml/' + prov +'/' + code + "_e.xml")
    	// handle success
				//console.log(response.data)
				const formated = (txml.simplify(txml.parse(response.data)).siteData)
				//console.log(formated)
				const current = formated.currentConditions
				const wind = current.wind
		
				const currentembed = {
					color: "#FF7700",
					title: 'Curent Conditions @ ' + current.station,
					url: "https://weather.benja.ml/",
					author: {
						name: 'Benja Weather',
						icon_url: checkIcon(formated.currentConditions.iconCode),
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					description: current.condition + " | " + current.temperature + '°C',
					thumbnail: {
						url: 'https://weather.benja.ml/forcast/?id=' + code,
					},
					fields: [
						{
							name: 'Dew Point',
							value: current.dewpoint,
							inline: true,
						},
						{
							name: 'Pressure',
							value: current.pressure,
							inline: true,
						},		
						{
							name: 'Visibility',
							value: current.visibility,
							inline: true,
						},		
						{
							name: 'Humidity',
							value: current.relativeHumidity,
							inline: true,
						},								
						{
							name: 'Humidity',
							value: wind.speed + " KM/H " + wind.direction + " (" + wind.bearing + "°)",
							inline: true,
						},					
						],
	timestamp: new Date(),
	footer: {
		text: 'Powered by Benja Weather',
		icon_url: "https://weather.benja.ml/photos/icon-white.png",
	},
	
};
		const res = {embeds: [currentembed]}
		return res
	},
	hourly: async function (code,prov) {
				const response = await axios.get('https://dd.weather.gc.ca/citypage_weather/xml/' + prov +'/' + code + "_e.xml")
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
					color: "#FF7700",
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
					icon_url: "https://weather.benja.ml/photos/icon-white.png",
					},
				};
	
		const res = {embeds: [perday_embed]}
		return res
	},
	daily: async function (code,prov) {
				const response = await axios.get('https://dd.weather.gc.ca/citypage_weather/xml/' + prov +'/' + code + "_e.xml")
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
					color: "#FF7700",
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
					icon_url: "https://weather.benja.ml/photos/icon-white.png",
					},
				};
		const res = {embeds: [perday_embed]}
		return res
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

function checkIcon(icon) {
	if (icon === "" || icon === undefined || icon === null) {
		return theme.logo
	} else {
		return 'https://weather.gc.ca/weathericons/' + icon + ".gif"
	}
}