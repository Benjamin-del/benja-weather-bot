console.log("WEB: STARTING")
var express = require('express');
var app = express();
const fs = require('fs');
const axios = require("axios")
const process = require("process")
const stlist = require("./config/locations.json")
const config = require("./config/web.json")
var PORT = 3000;

app.use(express.json())    
app.use('/static', express.static('web-files'))

app.get('/login', function(req, res) {
	res.sendFile(__dirname + "/html/login.html");
})
app.get('/dash', function(req, res) {
	res.sendFile(__dirname + "/html/dash.html");
})
app.get('/', function(req, res) {
	res.sendFile(__dirname + "/html/home.html");
})

app.post('/login', async function(req, res) {
	const config = {
		headers: {
			"authorization": "Bearer " + req.body.token
		}
	}
	const response = await axios.get("https://discordapp.com/api/users/@me", config)
	const re = response.data
	const photo = "https://cdn.discordapp.com/avatars/" + re.id + "/" + re.avatar + ".webp"
	res.json({
		status: "200",
		username: re.username,
		id: re.id,
		tag: re.discriminator,
		photo: photo
	})
})

app.get('/user', (req, res) => {
		const data = fs.readFileSync('config/users.json');
		const json = JSON.parse(data)
		const users = json.u
		const match = []
		const id = req.query.id
		for (let i = 0; i < users.length; i++) {
			if (id === users[i].user) {
				match.push(users[i])
				break
			}
		}
		if (match.length === 0) {
			res.status(404).json({
				user: "404",locations: ["404"]
			})
		} else {
			res.json(match[0])
		}
});

app.get('/loc', (req, res) => {
		const data = fs.readFileSync('config/locations.json');
		const json = JSON.parse(data)
	
		const places = json.stations
		const result = []
		const query = req.query.q
		const id = req.query.id
	
		for (let i = 0; i < places.length; i++) {
			const name = places[i].name
			const code = places[i].code
			
			if (name.includes(query) || id === code) {
				result.push(places[i])
			}
		}
		res.json({
			length: result.length,
			results: result
		})
});
app.post('/user', async function(req, res) {
		const data = fs.readFileSync('config/users.json');
		const json = JSON.parse(data)
		const users = json.u
		const newarr = users.filter(function(el) { return el.user != req.body.user; });
		const locations = []
		const locs = req.body.locations
			for (let i = 0; i < locs.length; i++) {			
			locations.push(find(locs[i]))
		}
	
		const newobj = {
			user : req.body.user,
			locations : locations.slice(0, 5)
		}
		newarr.unshift(newobj)

		var newJs = {
			u: newarr
		}
		 
		fs.writeFileSync('config/users.json', JSON.stringify(newJs, null, "\t"), "UTF-8", { 'flags': 'a' });
		res.json({
			status : "200 - OK",
			new_data : newobj
		})
})

process.on('uncaughtException', function (err) {
	console.log("WEB: ERROR");
  console.error(err);
});

function find(code) {
		const places = stlist.stations
		for (let i = 0; i < places.length; i++) {
			if (places[i].code === code) {
				return places[i]
			}
		}
}

app.listen(PORT, function(err) {
	if (err) console.log(err);
	console.log("WEB: READY ON PORT " + PORT)
	console.log("WEB: /SAVED: " + config.enabled)
});