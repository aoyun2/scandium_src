const Discord = module.require("discord.js");
const fs = require('fs');

function generatePassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

module.exports.run = async (bot, message, args) => {
     //return await message.reply("**register** command disabled; we are not accepting new users at this moment.")
     //await message.channel.send("Not implemented.");
     //return;

     const rawdata = fs.readFileSync('users.json');
     const usersObj = JSON.parse(rawdata);
     //console.log(usersObj)

     if (message.author.id in usersObj) {
       const exampleEmbed2 = new Discord.RichEmbed()
        .setColor('#ff0000')
        .setTitle("Already registered")
        .setDescription(`You can login [here](https://scandium.glitch.me/) with the credentials:\n
        Username: \`${message.author.username}\`\n
        Password: \`${usersObj[message.author.id]}\``);
       
       await message.reply("Check your DMs :mailbox_with_mail:")
       return await message.author.send(exampleEmbed2);
     }

     const pass = generatePassword();
   
     const newObj = usersObj;
     newObj[message.author.id] = pass;

     fs.writeFileSync('users.json', JSON.stringify(newObj)); 
  
     const exampleEmbed2 = new Discord.RichEmbed()
        .setColor('#A3A6E8')
        .setTitle("Success!")
        .setDescription(`You can now login [here](https://scandium.herokuapp.com/) with the credentials:\nUsername: \`${message.author.username}\`\n\`Password: ${pass}\``);
     await message.reply("Check your DMs :mailbox_with_mail:")
     await message.author.send(exampleEmbed2);
}

module.exports.getUser = (ID, password) => {
    //console.log(ID);
    const rawdata = fs.readFileSync('users.json');
    const usersObj = JSON.parse(rawdata);
    const userPass = Object.values(usersObj).find(v => v === password);
    const userID = Object.keys(usersObj).find(k => k === ID);
  
    if(userPass === undefined || userID === undefined) return undefined;
    else return ([userPass, userID]);
}

module.exports.help = {

    name: "register",
    desc: "l",
    personalThoughts: "dkss"

}
