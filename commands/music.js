const Discord = module.require("discord.js");
const ytdl = require('discord-ytdl-core');
const ytdl2 = require('ytdl-core');
const yts = require("yt-search");
const botSettings = require("../botsettings.json");

let timeoutIDs = {};
module.exports.queues = {};

module.exports.run = async (bot, message, args) => {
  let vcdisconnectErr;
  let channel = message.channel;
  let skipmsg;
  
  try {
    if (channel instanceof Discord.DMChannel) {
      const exampleEmbed2 = new Discord.RichEmbed()
        .setColor('#ff0000')
        .setTitle(`This command is not allowed in DMs`);
      return await channel.send(exampleEmbed2);
    }
    
    if (timeoutIDs[message.guild.id]) clearTimeout(timeoutIDs[message.guild.id]);
    timeoutIDs[message.guild.id] = undefined;
    
    if (!args || args.length !== 1) {
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`Invalid command structure.`);
        return await channel.send(exampleEmbed2); 
    }
    
    const voiceChannel = message.member.voiceChannel;
    vcdisconnectErr = voiceChannel;
    
    if (!voiceChannel) {
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`Join a voice channel`)
                .setDescription("to use this command");
        return await channel.send(exampleEmbed2); 
    }
    else if (message.guild.voiceConnection && message.guild.voiceConnection.channel !== voiceChannel) {
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`The bot is already in a voice channel`)
                .setDescription("join it to use this command");
        return await channel.send(exampleEmbed2); 
    }
    
    const connection = await voiceChannel.join();
    (await message.guild.members.get("737402786085601342")).setDeaf(true);
    
    if (!module.exports.queues[message.guild.id]) {module.exports.queues[message.guild.id] = [args[0]];}
    else if (module.exports.queues[message.guild.id]) {
        module.exports.queues[message.guild.id].push(args[0]);
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#A3A6E8')
                .setTitle(`Queued!`);
        await channel.send(exampleEmbed2);

        return;
    }
    
    function playqueue() {
      yts({query: module.exports.queues[message.guild.id][0]}, async function ( err, r ) {
          try {
            if (err) throw err;
            
            let video;
            if(module.exports.queues[message.guild.id] && await ytdl2.validateURL(module.exports.queues[message.guild.id][0])) {
               video = await ytdl2.getInfo(module.exports.queues[message.guild.id][0]);
            } else {
              video = r.videos[0];
            }
                            
            const url = (await ytdl2.validateURL(args[0])) ? args[0] : video.url;
            
            const stream = ytdl(url, {
                filter: "audioonly",
                opusEncoded: true,
                encoderArgs: ['-af', 'bass=g=10,dynaudnorm=f=200']
            });
            
            const dispatcher = connection.playOpusStream(stream);
            const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#A3A6E8')
                .setTitle(`Now Playing:`)
                .setDescription(video.videoDetails && video.videoDetails.title || video.title);
            await channel.send(exampleEmbed2);
            
            bot.on("message", async (m) => {
              if (m.guild.id != message.guild.id) return;
              else if (m.content === `${botSettings.prefix}skip`) {
                channel = m.channel;
                skipmsg = await m.reply("Please wait...");
                await stream.end();
              }
            });
            
            dispatcher.on("end", async end => {
              try {
                module.exports.queues[message.guild.id].shift();
                if (skipmsg && skipmsg.delete) {skipmsg.delete(); skipmsg = undefined;}
                
                if (module.exports.queues[message.guild.id].length === 0) {
                  module.exports.queues[message.guild.id] = undefined;
                  const exampleEmbed2 = new Discord.RichEmbed()
                    .setColor('#A3A6E8')
                    .setTitle(`End of queue`)
                    .setDescription("bot will disconnect after 1 minute of inactivity");
                  await channel.send(exampleEmbed2);
                  
                  timeoutIDs[message.guild.id] = setTimeout(async () => {
                      await voiceChannel.leave();
                      const exampleEmbed2 = new Discord.RichEmbed()
                      .setColor('#ff0000')
                      .setTitle(`Disconnected:`)
                      .setDescription("Bot inactive for too long.");
                      return await channel.send(exampleEmbed2); 
                  }, 60 * 1000)
                  return;
                } else {
                  console.log(module.exports.queues[message.guild.id]);
                  playqueue();
                }
              } catch(e) {console.log(e)}
            });
          } catch(e) {
            console.log(e);
            const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`Video not found.`)
            await channel.send(exampleEmbed2);
            
            module.exports.queues[message.guild.id].shift();
            if (module.exports.queues[message.guild.id].length === 0) {
              module.exports.queues[message.guild.id] = undefined;
              const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#A3A6E8')
                .setTitle(`End of queue`)
                .setDescription("bot will disconnect after 1 minute of inactivity");
              await channel.send(exampleEmbed2);

              timeoutIDs[message.guild.id] = setTimeout(async () => {
                await voiceChannel.leave();
                const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`Disconnected:`)
                .setDescription("Bot inactive for too long.");
                return await channel.send(exampleEmbed2); 
              }, 60 * 1000)
              return;
            } else {
              console.log(module.exports.queues[message.guild.id]);
              playqueue();
            }
         }
      });
    };
    
    playqueue();
  } catch(e) {
    console.log(e.stack);
    const exampleEmbed2 = new Discord.RichEmbed()
        .setColor('#ff0000')
        .setTitle(`Disconnected:`)
        .setDescription(e.stack);
    vcdisconnectErr.leave();
    return await channel.send(exampleEmbed2); 
  }
}

module.exports.help = {

    name: "play",
    desc: "oof",
    personalThoughts: "annoy"

}
