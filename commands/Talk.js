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
        
        const context = message.channel.messages.map(m => `${m.author.username}: ${m.content.replace("<>talk", '')}`).join('\n');
        console.log(context);
        
        let response = await message.channel.send(new Discord.RichEmbed().setTitle("Waiting for a response <a:scanloading:804509467680702465>"));
        
        const browser = await puppeteer.launch({
          args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
        ]});
        
        const page = await browser.newPage();
        await page.goto('https://bellard.org/textsynth/',
            {timeout: 9999999},
            { waitUntil: "networkidle0" }
        );
        
        await page.select("#model", "1558M");
        
        await page.evaluate((text) => {
            document.querySelector('#input_text').value = text;
        }, context.concat("\nScandium: "));
        
        await page.click('#submit_button');
        
        let responseText = '';
        
        async function monitorResponse () {
          const newVal = (await page.evaluate(() => document.querySelector('#gtext').textContent)).replace(context, '').split('\n')[1].replace("Scandium:", '');
          if (newVal !== responseText && newVal !== '') {
            response.suppressEmbeds(true);
            message.channel.startTyping();
            await response.edit(newVal);
            responseText = newVal;
          }
          message.channel.stopTyping();
        }
        
        let ResponseID = setInterval(async () => { await monitorResponse() }, 500);
        await page.waitForSelector('#more_button', {
          visible: true,
          timeout: 99999999
        });
        
        clearInterval(ResponseID);
        await browser.close();
    }
    catch(e) {
      console.log(e.stack);
    }
}

module.exports.help = {
    name: "talk",
    desc: "talk to scottie",
}
