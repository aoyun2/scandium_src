const Discord = module.require("discord.js");
const https = require('https');
const fs = require('fs');


module.exports.run = async (bot, message, args) => {
    try {
        if (message.channel instanceof Discord.DMChannel) {
            const exampleEmbed2 = new Discord.RichEmbed()
              .setColor('#ff0000')
              .setTitle(`This command is not allowed in DMs`);
            return await message.channel.send(exampleEmbed2);
        }
      
        let msg = await message.channel.send("Please Wait...");
        
        let olivers = fs.readdirSync('./oliver/');
        let oliver = olivers[Math.floor(Math.random() * olivers.length)];
      
        //console.log(oliver);

        const exampleEmbed = new Discord.RichEmbed()
          .setColor('#A3A6E8')
          .attachFiles([`./oliver/${oliver}`])
          .setImage(`attachment://${oliver}`)
	      
        await msg.delete(10);
        message.channel.send(exampleEmbed);
    } catch(e) {
        console.log(e.stack);
    }
}

module.exports.help = {

    name: "oliver",
    desc: "random meow",
    personalThoughts: "meow"

}
