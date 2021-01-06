const botSettings = require("./botsettings.json");
const server = require('./server.js');
const Discord = require("discord.js");
const puppeteer = require('puppeteer');
const userHandler = require("./commands/register.js");
const fs = require("fs");
const fetch = require('node-fetch');
var FileReader = require('filereader')
const prefix = botSettings.prefix;
const bot = new Discord.Client();
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

	if (err) {
		console.error(err);
	}

	let jsFiles = files.filter(f => f.split(".").pop() === "js");

	if (jsFiles.length <= 0) {

		console.error("No commands found.");
		return;

	}

	jsFiles.forEach((f, i) => {

		let props = require("./commands/" + f);
		bot.commands.set(props.help.name, props);
	});
});

bot.on("ready", async () => {
	bot.user.setActivity("https://scandium.herokuapp.com/");
  
  /*let maintain = setInterval(async () => {
        try {
            const browser = await puppeteer.launch({args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ]});

            const page = await browser.newPage();
            await page.goto('https://scandium.glitch.me/', {
                      timeout: 60000
            });
            await page.waitForSelector('body > form');
            await browser.close();
        } catch(e) {console.log(e);}
  }, 60000);*/
  
  const Stuff = bot.guilds.get("710534370510897192")
  const channel = Stuff.channels.get("774850090816634922")
  const kelly = Stuff.members.find(m => m.user.username == "lemon");
  await channel.send(`Kelly's ID is ${kelly.user.id}`);
});

bot.on("guildCreate", async guild => {
    const help = await bot.commands.get("help");
    const channel = guild.channels.find(
      (c) => c.type === "text" && c.permissionsFor(guild.me).has("SEND_MESSAGES")
    );
    await help.run(bot, channel, null);
});

bot.on('voiceStateUpdate', async (old, newm) => {
    let oldUserChannel = old.voiceChannel;
    if (oldUserChannel && oldUserChannel.members.array().length === 1) {
        (await bot.commands.get("play")).queues[oldUserChannel.guild.id] = undefined;
	(await bot.commands.get("play")).timeoutIDs[oldUserChannel.guild.id] = undefined
        oldUserChannel.leave();
    }
})

bot.on("message", async (message) => {
  if(message.mentions.members) {
    if(message.mentions.members.first()) {
      if (message.mentions.members.first().id == '737402786085601342') {
        const help = await bot.commands.get("help");
        await help.run(bot, message, null);
      }
    }
  }
  
  if (message.channel.type !== 'dm') {
    if (Object.values(server.usedChns).includes(`${message.guild.name},${message.channel.name}`)) {
      server.updateMsgs(message.guild.name, message.channel.name, "newMsg");
    }
  }
  
	if (!message.content.includes(prefix) /*|| message.author.bot*/) {return;}
  
	let command = message.content.split(/\s+/g)[0];
	let args = message.content.replace(`${command} `, '').split('::');
  if (args.includes(command)) args = [];
  
	let cmd = await bot.commands.get(command.replace(prefix, ''));
  
  if (cmd){
    await cmd.run(bot, message, args);
  }
});

module.exports.sendMsg = async (serv, chn, msg, userID) => {
  try {
    //get username and pfp from id
    const server = bot.guilds.find(s => s.name === serv);
    const channel = server.channels.find(c => c.name === chn);
    const user = server.members.get(userID);
    if (!(user.permissionsIn(channel).has("SEND_MESSAGES"))) return "";
    let webhooks = await channel.fetchWebhooks();
    if (Array.from(webhooks).length === 0) {
      console.log("empty");
      await channel.createWebhook("Scandium", "https://cdn.glitch.com/3ebdc662-0a1e-4e5b-a129-4e6528173744%2Fsc-213674.webp?v=1605487166515");
      webhooks = await channel.fetchWebhooks();
    }
    
    const webhook = webhooks.first();
    await webhook.send(msg, {
	    username: user.user.username,
    	avatarURL: user.user.avatarURL
    });
  } catch(e) {console.log(e); return "";}
}

module.exports.getMsgs = async (serv, chn, mode, before) => {
  try{
    let amount;
    const server = bot.guilds.find(s => s.name === serv);
    const channel = server.channels.find(c => c.name === chn);
    if (mode === "all" || mode === "before") amount = 10;
    else if (mode === "newMsg") amount = 1;
    
    let allMsgs = (await channel.fetchMessages({ limit: amount, before: before })).map(async m => {
      let messagecontent = [m.author.username, m.createdAt, m.content, m.id];
      let attachmentcontent = [];
      
      if (m.attachments) {
        for(let r of m.attachments) {
          if(r[1].url.match(/\.(jpeg|jpg|gif|png|mp4)$/)) {
            const a = await fetch(r[1].url);
            const b = await a.blob();
            attachmentcontent.push([b.type, await b.arrayBuffer()]); 
          }
        }
      }
      
      const urls = m.content.match(/(\b(https?|http):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
      if(urls) {
        for(let r of urls) {
          if(r.match(/.(jpeg|jpg|gif|png|mp4)/)) {
            try {
              const a = await fetch(r);
              const b = await a.blob();
              attachmentcontent.push([b.type, await b.arrayBuffer()]); 
            } catch {continue;}
          }
        }
      }

      return [messagecontent, attachmentcontent];
    });
    
    const out = await Promise.all(allMsgs);
    return out;
  } catch(e) {return "";}
}

module.exports.getChns = (serv) => {
  try {
    const server = bot.guilds.find(s => s.name === serv);
    
    let allChns = server.channels.filter(c => c.type === "text").map(c => c.name);
    return allChns;
  } catch{return "";}
}

module.exports.canSee = (serv, chn, usr) => {
  try {
    //console.log(serv, chn, user)
    const server = bot.guilds.find(s => s.name === serv);
    const channel = server.channels.find(c => c.name === chn);
    const user = channel.members.find(m => m.user.username === usr);
    //console.log(user)
    if(user) {
	 if(!(user.hasPermission("READ_MESSAGE_HISTORY"))) {console.log("hai"); return false;}
	 return true;
    }
    else if(!user) return false;
  } catch(e) {console.log(e); return false;}
}

module.exports.getID = (username, Server) => {
  try{
    const userServer = bot.guilds.find(s => s.name === Server);
    //console.log(userServer)
    const user = userServer.members.find(m => m.user.username === username);
    
    //console.log(user)
    if(user) return user.id;
    else return undefined;
  }   
  catch(e) {return undefined;}
}


bot.login(botSettings.token);
