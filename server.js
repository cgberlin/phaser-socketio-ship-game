var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var $ = require('jquery');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function (socket) {
  console.log("client connected");
});


server.listen(process.env.PORT || 8080);
console.log('launching server on 8080 now!>>>>>>>>>>>');
