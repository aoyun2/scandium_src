const Discord = module.require("discord.js")

module.exports.run = async (bot, message, args) => {
    try {
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
        const exampleEmbed2 = new Discord.RichEmbed()
          .setColor('#A3A6E8')
          .setTitle("Invite Scandium to your server:")
          .setDescription(link)
        await message.channel.send(exampleEmbed2);
    } catch (e) {
        console.log(e.stack)
    }
}

module.exports.help = {
    name: "invite",
    desc: "oliver",
    personalThoughts: "oliver"
}