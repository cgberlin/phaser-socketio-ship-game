var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

io.on('connection', function (socket) {
  console.log("client connected");
  socket.broadcast.emit('newEnemy');
  socket.on('playerMove', function(){
  	socket.broadcast.emit('yourEnemyIfNewConnect');
  });

  socket.on('enemyMove', function(enemyLocation){
  	socket.broadcast.emit('updateEnemyMove', enemyLocation);
  });

  socket.on('myBullets', function(bulletLocationInfo){
  	socket.broadcast.emit('enemyBullets', bulletLocationInfo);
  });

});


server.listen(process.env.PORT || 8080);
console.log('launching server on 8080 now!>>>>>>>>>>>');
