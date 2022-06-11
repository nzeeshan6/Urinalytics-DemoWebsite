const https = require("https");
const fs = require("fs");

const express = require("express");
const favicon = require('serve-favicon');
const app = express();
const bodyParser = require('body-parser');
const url = require('url');


const server = https.createServer({
    key: fs.readFileSync(__dirname + "/cert/key.pem", 'utf-8'),
    cert: fs.readFileSync(__dirname + "/cert/cert.pem", 'utf-8')
}, app);

app.use(favicon(__dirname + '/ico.png'));
app.use(bodyParser.urlencoded({
    extended: true
}));

var io = require('socket.io')(server);


server.listen(3000, function () {
    console.log("[RUNNING]: Https Server on Port 3000");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
    const urlobject = url.parse(req.url, true);
    // console.log(urlobject);
    const filename = "." + urlobject.pathname;

    fs.readFile(filename, function (err, data) {
        if (err) {
            fs.readFile('./404.html', function (err, html) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(html);
            });
        } else {
            res.writeHead(200, {'Content-Type':'text/html'});
            res.write(data);
            res.end();
        }
    })
});

app.post("/", function (req, res) {
    console.log("Inside the post method");
});

var name = "Zeeshan Naseem";

io.sockets.on('connection', function (socket) {
    io.sockets.emit('updateInfo', {
        name: name
    });
});