const express = require("express");
const bodyParser = require("body-parser");
const botMain = require("./bot.js");
const userHandler = require("./commands/register.js");
const app = express();
const fs = require("fs");
const serverhttp = require('http').createServer(app).listen(process.env.PORT, () => {
  console.log(`server is listening on port ${process.env.PORT}`);
});
const io = require('socket.io')(serverhttp);
const { v4: uuidv4 } = require('uuid'); 

module.exports.usedChns = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'pug')

app.get("/", (request, response) => {
  response.render('sendToDiscord');
  console.log("pinged :)");
  response.end("OK");
});

io.on('connection', (socket) => {
  socket.emit('id', uuidv4());
  
  socket.on('loadMsgs', (data) => {
    module.exports.updateMsgs(data.server, data.channel, data.mode);
    //console.log([data.channel, botMain.getMembers(data.server, data.channel)]);
  });
  
  socket.on('loadMor', (data) => {
    module.exports.updateMsgs(data.server, data.channel, data.mode, data.before);
    //console.log(data.before);
  });
  
  socket.on('updateArr', (data) => {
    const channel = data.channel;
    const server = data.server;
    const id = data.ID;
    
    delete module.exports.usedChns[id];
    if (channel !== "") module.exports.usedChns[id] = `${server},${channel}`;
  });
  
  socket.on('sendMessage', async (data) => {
    const content = data.content;
    const server = data.server;
    const channel = data.channel;
    const userID = data.userID;

    if (content !== '') {
      const response = await botMain.sendMsg(server, channel, content, userID);
      if (response === "") {socket.emit("senderr", undefined);}
    }
  });
  
  socket.on("verifyUser", (data) => {
    const username = data[1];
    const server = data[0];
    const password = data[2];
    const id = botMain.getID(username, server);
    //console.log(data);
    if (userHandler.getUser(id, password)) socket.emit("verifySuccess", true);
    else socket.emit("verifyFail", undefined);
  });
});

module.exports.updateMsgs = async (server, channel, mode, before) => {
  const data = {
    mode: mode,
    channel: channel,
    messages: await botMain.getMsgs(server, channel, mode, before)
  }
  io.emit('messagePackage', data);
}

app.post('/connect', async (req, res) => {
    try {
        const server = req.body.serv;
        const user = req.body.user;
        const pass = req.body.pass;
        const channels = botMain.getChns(server).filter(c => botMain.canSee(server, c, user));
      
        const id = botMain.getID(user, server);
        
        if (userHandler.getUser(id, pass)) {
            res.render('sconnected', {
                welcome: `Welcome, ${user}!`,
                ser: server,
                chns: channels,
                id: id,
            });
        }
        else {
           res.send("Invalid credentials. Please check if you are in the server that you are attempting to join.");
        }
    }
    catch(e) {
      console.log(e.stack);
    }
});