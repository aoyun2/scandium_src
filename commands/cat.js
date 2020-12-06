const Discord = module.require("discord.js");
const https = require('https');

const clientId = '78ea638615ae44f';

function handleData(result) {
    let id = Math.floor(Math.random() * result.data.length)

    if (result.data.length > 0) {
        if (result.data[id].link.includes(".png") || result.data[id].link.includes(".jpg") || result.data[id].link.includes(".gif")) {
            return result.data[id].link
        }
        else {
            return handleData(result)
        }
    }
}

function request() {
	return new Promise((success, fuckedup) => {   
		const options = {
		    host: 'api.imgur.com',
		    path: '3/gallery/search?q=catpictures',
		    headers: {
			Authorization: 'Client-ID ' + clientId
		    }
		};

		https.get(options, (resp) => {
		      let data = '';
		      resp.on('data', (chunk) => {
			    data += chunk;
		      });

		      resp.on('end', () => {
			    success(data);
		      });
		}).on("error", (err) => {
		       fuckedup(err);
		});
	});
}

async function rimgur() {
  let link;
	try {
		let data = await request();
		return handleData(JSON.parse(data));
	}
	catch(error) {
		console.log(error);
	}
}

module.exports.run = async (bot, message, args) => {
    try {
        if (message.channel instanceof Discord.DMChannel) {
            const exampleEmbed2 = new Discord.RichEmbed()
              .setColor('#ff0000')
              .setTitle(`This command is not allowed in DMs`);
            return await message.channel.send(exampleEmbed2);
        }
        let m = await message.reply("Please Wait...");
        let img = await rimgur();
        const exampleEmbed = new Discord.RichEmbed()
          .setColor('#A3A6E8')
          .setTitle('Meow')
          //.setDescription('Meow')
          //.setThumbnail(img)
          .setImage(img)
          .setTimestamp()
	      m.delete(100);
        await message.channel.send(exampleEmbed);
    } catch(e) {
        console.log(e.stack);
    }
}

module.exports.help = {

    name: "cat",
    desc: "random meow",
    personalThoughts: "meow"

}
