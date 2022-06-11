const https = require("https");
const fs = require("fs");

const express = require("express");
const favicon = require('serve-favicon');
const app = express();

const url = require('url');
const path = require('path');

const server = https.createServer({
    key: fs.readFileSync(__dirname + "/cert/key.pem", 'utf-8'),
    cert: fs.readFileSync(__dirname + "/cert/cert.pem", 'utf-8')
}, app);

app.use(favicon(__dirname + '/ico.png'));
// app.use('/', function(res, req, next){
//     console.log(res.url);
//     next();
// })
app.use(express.static(path.join(__dirname)));

var io = require('socket.io')(server);


server.listen(3000, function () {
    console.log("[RUNNING]: Https Server on Port 3000");
});

app.get('/', function (req, res) {
    // res.sendFile(__dirname + '/index.html');
    const urlobject = url.parse(req.url, true);
    console.log(req.url);
    const filename = "." + urlobject.pathname;
    if (req.url === '/'){
        fs.readFile("./index.html", function(err, html){
            
            if (err) {
                fs.readFile('./404.html', function(err, html){
                    res.writeHead(404, {"Content-Type":"text/html"});
                    res.end(html);
                })
                
            }
            else {
                res.writeHead(200, {"Content-Type":"text/html"});
                res.end(html);
            }
        })
        // res.sendFile(__dirname + '/index.html', function(err){
        //     res.writeHead(200, {"Content-Type":"text/html"});
        // //         res.end(html);
        // })
    }else if (req.url.match("\.css$")){
        var cssPath = path.join(__dirname + req.url);
        var fileStream = fs.createReadStream(cssPath, "utf-8");
        res.writeHead(200, {'Content-Type':'text/html'});
        fileStream.pipe(res);
    }else if (req.url.match("\.png$")){
        var pngPath = path.join(__dirname + req.url);
        var fileStream = fs.createReadStream(pngPath);
        res.writeHead(200, {'Content-Type':'image/png'});
        fileStream.pipe(res);
    }else if (req.url.match("\.jpg$")){
        var jpgPath = path.join(__dirname + req.url)
        var fileStream = fs.createReadStream(jpgPath);
        res.writeHead(200, {'Content-Type':'image/jpg'});
        fileStream.pipe(res);
    }else if (req.url.match('\.html$')){
        var filePath = __dirname + req.url;
        fs.readFile(filePath, function(err, html){
            if (err) {
                fs.readFile('./404.html', function(err, html){
                    res.writeHead(404, {"Content-Type":"text/html"});
                    res.end(html);
                })
                
            }
            else {
                res.writeHead(200, {"Content-Type":"text/html"});
                res.end(html);
            }
        })        
    }else{
        fs.readFile('./404.html', function(err, html){
            res.writeHead(404, {"Content-Type":"text/html"});
            res.end(html);
        }) 
    }

    
});

var name = "Zeeshan Naseem";

io.sockets.on('connection', function (socket) {
    io.sockets.emit('updateInfo', {
        name: name
    });
});