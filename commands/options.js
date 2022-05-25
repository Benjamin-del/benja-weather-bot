console.log("BOT: COMMAND OPTIONS LOADED")
module.exports = {
	command: function(code,prov) {
			const comp = [
			{
				"type": 2,
				"label": "(1) Current Conditions",
				"style": 1,
				"custom_id": "opt-c-" + code + "-" + prov + "-" + Math.floor(Math.random() * (1000 - 1) + 1)
			},
			{
				"type": 2,
				"label": "(2) Hourly Forcast",
				"style": 1,
				"custom_id": "opt-hr-" + code + "-" + prov + "-" + Math.floor(Math.random() * (1000 - 1) + 1)
			},
			{
				"type": 2,
				"label": "(3) 7-day Forcast",
				"style": 1,
				"custom_id": "opt-7-" + code + "-" + prov + "-" + Math.floor(Math.random() * (1000 - 1) + 1)
			},

			]
		const res = {components: [{ "type": 1, "components": comp }] }
		return res
	}
}

