const Discord = module.require("discord.js");
const cb = require("cleverbot-free");

module.exports.run = async (bot, message, args) => {
    try {       
        if (args.length !== 1) {
          const exampleEmbed2 = new Discord.RichEmbed()
            .setColor('#ff0000')
            .setTitle(`Invalid command structure.`);
          return await message.channel.send(exampleEmbed2);
        }
      
        const context = (await message.channel.fetchMessages({limit: 100, before: message.id})).map(m => m.content).reverse();
        const response = await cb(args[0], context);
        await message.channel.send(response);
    }
    catch(e) {
      console.log(e.stack);
    }
}

module.exports.help = {
    name: "talk",
    desc: "talk to mitsuku",
}
