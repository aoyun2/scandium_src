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
        }, context.concat("\nScottie: "));
        
        await page.click('#submit_button');
        
        let response = await message.channel.send("Please Wait...");
        
        const responseText = await page.$x('//*[@id="gtext"]/text()');
        
        async function monitorResponse () {
          const newVal = await page.$x('//*[@id="gtext"]/text()');
          if (newVal !== responseText) {
            let newText = newVal.getProperty('textContent')  
            await response.edit(newText);
            responseText = newVal;
          }
        }
        
        let ResponseID = setInterval(async () => { await monitorResponse() }, 2000);
        await page.waitForSelector('#more_button', {
          visible: true,
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
