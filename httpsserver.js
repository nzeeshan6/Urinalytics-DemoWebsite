const https = require("https");
const fs = require("fs");

const express = require("express");
const favicon = require("serve-favicon");
const app = express();

const url = require("url");
const path = require("path");

const server = https.createServer(
  {
    key: fs.readFileSync(__dirname + "/cert/key.pem", "utf-8"),
    cert: fs.readFileSync(__dirname + "/cert/cert.pem", "utf-8"),
  },
  app
);

app.use(favicon(__dirname + "/ico.png"));

app.use(express.static(path.join(__dirname)));

var io = require("socket.io")(server);

server.listen(3000, function () {
  console.log("[RUNNING]: Https Server on Port 3000");
});

app.get("/", function (req, res) {});

app.get("*", function (req, res) {
  res.sendFile(__dirname + "/404.html");
});
var name = "Zeeshan Naseem";

// io.sockets.on('connection', function (socket) {
//     io.sockets.emit('updateInfo', {
//         name: name
//     });
// });
