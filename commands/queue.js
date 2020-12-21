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
    
    const queue = (await bot.commands.get("play")).queues[message.guild.id];
    
    if (!queue || queue.length < 1) {
        const exampleEmbed2 = new Discord.RichEmbed()
                .setColor('#ff0000')
                .setTitle(`Queue is empty.`);
        return await message.channel.send(exampleEmbed2); 
    }
    const queuedisplay = queue.map(q => {
      if (queue[0] === q) return `\`\`\`diff\n+ ${q}\`\`\``;
      return `\`\`\`diff\n- ${q}\`\`\``;
    }).join('\n');
    const exampleEmbed2 = new Discord.RichEmbed()
      .setColor('#A3A6E8')
      .setTitle(`Queue`)
      .setDescription(queuedisplay);
    message.channel.send(exampleEmbed2);
}

module.exports.help = {
    name: "q",
    desc: "oof",
    personalThoughts: "annoy"
}
