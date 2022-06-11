var express = require('express');
const { append } = require('express/lib/response');
var favicon = require('serve-favicon');
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);


server.use(favicon(__dirname+'/ico.png'));
server.set('view engine','ejs');
// server.use(express.static(`${__dirname}/public`));

server.get('/', function(req, res){
    // res.sendFile(`${__dirname}/dashboard.html`);
    res.sendFile(__dirname+"/dashboard.html");
});

http.listen(3000, function () {
    console.log('Listening on: 3000');
})
var name = "Zeeshan Naseem";

io.sockets.on('connection', function(socket){
    io.sockets.emit('updateInfo', {
        name:name
    });
});