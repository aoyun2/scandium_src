const Discord = module.require("discord.js");
//const cb = require("cleverbot-free");
const puppeteer = require("puppeteer");

module.exports.run = async (bot, message, args) => {
    try {       
        if (args.length !== 1) {
          const exampleEmbed2 = new Discord.RichEmbed()
            .setColor('#ff0000')
            .setTitle(`Invalid command structure.`);
          return await message.channel.send(exampleEmbed2);
        }
        
        /*const browser = await puppeteer.launch({
          args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
        ]});*/
        
        const context = await message.channel.fetchMessages({before: message.id}).array().map(m => `${m.author.username}: {m.content}`).reverse();
        
        const response = "";
        await message.channel.send(context.join('\n'));
    }
    catch(e) {
      console.log(e.stack);
    }
}

module.exports.help = {
    name: "talk",
    desc: "talk to scottie",
}
