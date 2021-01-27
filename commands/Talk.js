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
        
        let response = await message.channel.send("Please Wait...");
        
        const context = (await message.channel.fetchMessages({before: message.id})).map(m => `${m.author.username}: ${m.content.replace("<>talk", '')}`).reverse().join('\n');
        
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
        
        await page.evaluate((text) => {
            document.querySelector('#input_text').value = text;
        }, context.concat("\nScandium: "));
        
        await page.click('#submit_button');
        
        let responseText = '';
        
        async function monitorResponse () {
          const newVal = (await page.evaluate(() => document.querySelector('#gtext').textContent)).replace(context, '').split('\n', 1)[0];
          //console.log(newVal);
          if (newVal !== responseText && newVal !== '') {
            await response.edit(newVal);
            responseText = newVal;
          }
        }
        
        let ResponseID = setInterval(async () => { await monitorResponse() }, 1000);
        await page.waitForSelector('#more_button', {
          visible: true,
          timeout: 99999999
        });
        
        clearInterval(ResponseID);
    }
    catch(e) {
      console.log(e.stack);
    }
}

module.exports.help = {
    name: "talk",
    desc: "talk to scottie",
}
