const fs = require('node:fs');
const express = require('express');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();

const redirect_uri = 'https://absolutepos.herokuapp.com/ez';
var lyrics = ["FATHER INTO YOUR HANDS", "I COMMEND MY SPIRIT", "FATHER INTO YOUR HANDS", "WHY HAVE YOU", "FORSAKEN ME", "IN YOUR EYES", "FORSAKEN ME", "IN YOUR EYES", "FORSAKEN ME", "IN YOUR HEART", "FORSAKEN ME", "OH", "TRUST IN MY", "SELF RIGHTEOUS SUICIDE", "I CRY WHEN ANGELS DESERVE TO DIE"];
const app = express();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(process.env.TOKEN);

app.get('/ez', (req, res) => {
	console.log(req.query);
	exchange_code(req.query.code, async function(response){
		for(var i=0;i<lyrics.length;i++){
			await status_change(lyrics, response.access_token);
			console.log(lyrics[i]);
			await sleep(2000);
			if(i == lyrics.length - 1){
				i=0;
			}
		}
	});
	res.status(200).send("Received");
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Our app is running on port ${ PORT }`);
});

function exchange_code(code, callback){
	var options = {
		'method': 'POST',
		'hostname': 'discord.com',
		'path': '/api/v10/oauth2/token',
		'headers': {
		  'Content-Type': 'application/x-www-form-urlencoded'
		},
		'maxRedirects': 20
	  };
	  
	  var req = https.request(options, function (res) {
		var chunks = [];
	  
		res.on("data", function (chunk) {
		  chunks.push(chunk);
		});
	  
		res.on("end", function (chunk) {
		  var body = Buffer.concat(chunks);
		  console.log(body.toString());
		  let response = JSON.parse(body);
			callback(response);
		});
	  
		res.on("error", function (error) {
		  console.error(error);
		});
	  });
	  
	  var postData = qs.stringify({
		'client_id': process.env.CLIENT_ID,
		'client_secret': process.env.CLIENT_SECRET,
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': redirect_uri
	  });
	  
	  req.write(postData);
	  
	  req.end();
}

async function status_change(lyric, token){
    var options = {
        'method': 'PATCH',
        'hostname': 'discord.com',
        'path': '/api/v9/users/@me/settings',
        'headers': {
          'authorization': token,
          'Content-Type': 'application/json'
        },
        'maxRedirects': 20
      };
      
      var req = https.request(options, function (res) {
        var chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function (chunk) {
          var body = Buffer.concat(chunks);
          //console.log(body.custom_status.text);
        });
      
        res.on("error", function (error) {
          console.error(error);
        });
      });
      
      var postData = JSON.stringify({
        "custom_status": {
          "text": lyric
        }
      });
      
      req.write(postData);
      
      req.end();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}