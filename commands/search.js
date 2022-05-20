const stlist = require("../static/stations.json")
const h = require("../helper.js")
console.log("INFO: COMMAND /SEARCH READY")

module.exports = {
	command: async function(options,interaction) {
		const fields = []
		const comp = []
		const item = options.trimmed

		await interaction.editReply("Found `" + item.length + "` Results")


		for (let i = 0; i < item.length; i++) {

			const obj = {
				name: item[i].name + " `" + item[i].prov + "`",
				value: "Select (" + (i + 1) + ") To view this forcast",
				inline: true
			}
			fields.push(obj)
			const button = {
				"type": 2,
				"label": "(" + (i + 1) + ") " + item[i].name,
				"style": 1,
				"custom_id": "btn-" + i + "-" + item[i].code + "-" + item[i].prov + "-" + Math.floor(Math.random() * (1000 - 1) + 1)

			}

			comp.push(button)

		}
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
			description: 'Here is your results!',

			fields: fields,
			timestamp: new Date(),
			footer: {
				text: 'Powered by Benja Weather',
				icon_url: "https://weather.benja.ml/photos/icon-white.png",
			},
		};
		const res = { embeds: [results], components: [{ "type": 1, "components": comp }] }
		return res
	},
	helper: async function (query) {

	const matching = []
			const list = stlist.features
		  for (let i = 0; i < list.length; i++) {
				if (list[i].properties["English Names"].includes(query)) {

					const st = {
						name: h.fix(list[i].properties["English Names"]),
						code: list[i].properties["Codes"],
						prov: list[i].properties["Province Codes"]
						}
					matching.push(st)
				}
			}
	const results = {
		all: matching,
		trimmed: matching.slice(0, 5)
	}
	return results
	} 
}
