const axios = require("axios")
const fs = require('fs');
// This file updates locations.json.
module.exports = {
	web: async function() {
		const url = "https://collaboration.cmc.ec.gc.ca/cmc/cmos/public_doc/msc-data/citypage-weather/site_list_en.geojson"
		const response = await axios.get(url)
		const re = response.data
		const result = []
		
		const places = re.features
		for (let i = 0; i < places.length; i++) {
			const name = places[i].properties["English Names"]
			const code = places[i].properties.Codes
			const prov = places[i].properties["Province Codes"]
			
				const data = {
					name : name,
					code: code,
					prov: prov
				}
				result.push(data)
		}
		var newJs = {
			generated: new Date(),
			src: url,
			stations: result
		}
		 
		fs.writeFileSync('config/locations.json', JSON.stringify(newJs, null, "\t"), "UTF-8", { 'flags': 'a' });
		console.log('File Updated!')
		},
		file: function() {
		
		const data = fs.readFileSync('config/update.json');
		const json = JSON.parse(data)
	
		const result = []
	
		const places = json.features
			
		for (let i = 0; i < places.length; i++) {
			const name = places[i].properties["English Names"]
			const code = places[i].properties.Codes
			const prov = places[i].properties["Province Codes"]
				const data = {
					name : name,
					code: code,
					prov: prov
				}
				result.push(data)
		}
		var newJs = {
			generated: new Date(),
			src: "config/update.json",
			stations: result
		}
		 
		fs.writeFileSync('config/locations.json', JSON.stringify(newJs, null, "\t"), "UTF-8", { 'flags': 'a' });
		console.log('File Updated!')
	}
}