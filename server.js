var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var asteroidData,
	numberOfClients = 0;
createAsteroidGenerations();

io.sockets.on('connection', function (socket) {
  numberOfClients++;
  if (numberOfClients == 2){
  	io.emit('GoodToGo');
  }
  console.log("client connected" + numberOfClients);
  socket.on('SendOverTheAsteroidData', function(){
  	socket.emit('sendAsteroidData', asteroidData);
  });
  socket.on('enemyMove', function(enemyLocation){
  	socket.broadcast.emit('updateEnemyMove', enemyLocation);
  });

  socket.on('myBullets', function(bulletLocationInfo){
  	socket.broadcast.emit('enemyBullets', bulletLocationInfo);
  });

  socket.on('disconnect', function() {
  	numberOfClients--;
  });
});

function createAsteroidGenerations(){
	randomLocationValuesForAsteroids = [];
	randomAngularVelocityValues = [];
	randomAngleValues = [];
	randomVelocityValues = [];
	asteroidData = {
		numberOfAsteroids : Math.random() * (200 - 150) + 150,
	};

	for (var i = 0; i < asteroidData.numberOfAsteroids; i++){
		var randomValueX = Math.random() * (4000 - 30) + 30;
		var randomValueY = Math.random() * (4000 - 30) + 30;
		var tempObj = {
			x : randomValueX,
			y : randomValueY
		}

		var tempAngularVelocity = Math.random() * (150 - 50) + 50;
		var tempAngle = Math.random() * (180 + 180) - 180;
		var tempVelocity = Math.random() * (150 - 50) + 50;

		randomVelocityValues.push(tempVelocity);
		randomAngleValues.push(tempAngle);
		randomAngularVelocityValues.push(tempAngularVelocity);
		randomLocationValuesForAsteroids.push(tempObj);
	}
	asteroidData.locationValues = randomLocationValuesForAsteroids;
	asteroidData.angularVelocities = randomAngularVelocityValues;
	asteroidData.angles = randomAngleValues;
	asteroidData.randomVelocities = randomVelocityValues;
}


server.listen(process.env.PORT || 8080);
console.log('launching server on 8080 now!>>>>>>>>>>>');
