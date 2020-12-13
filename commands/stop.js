const Discord = module.require("discord.js");

module.exports.run = async (bot, message, args) => {
  
    if (message.channel instanceof Discord.DMChannel) {
      const exampleEmbed2 = new Discord.RichEmbed()
        .setColor('#ff0000')
        .setTitle(`This command is not allowed in DMs`);
      return await message.channel.send(exampleEmbed2);
    }
  
    const channel = message.member.voiceChannel;
    if (!channel) {
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`Join a voice channel`)
                .setDescription("to use this command");
        return await message.channel.send(exampleEmbed2); 
    }
    else if (message.guild.voiceConnection && message.guild.voiceConnection.channel !== channel) {
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`The bot is already in a voice channel`)
                .setDescription("join it to use this command");
        return await message.channel.send(exampleEmbed2); 
    }
  
    (await bot.commands.get("play")).queues[message.guild.id] = undefined;
    (await bot.commands.get("play")).timeoutIDs[message.guild.id] = undefined;
    await channel.leave();
}

module.exports.help = {
    name: "leave",
    desc: "oof",
    personalThoughts: "annoy"
}
