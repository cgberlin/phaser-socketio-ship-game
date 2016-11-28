var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var mongoose = require('mongoose');
var HighScore = require('./models/high-score');
var app = express();
var config = require('./config');

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

  socket.on('winner', function(name){
  	console.log(name);
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

var runServer = function(callback) {    //connects to the mongodb
    mongoose.connect(config.DATABASE_URL, function(err) {
        if (err && callback) {
            return callback(err);
        }

        server.listen(config.PORT, function() {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

exports.app = app;
exports.runServer = runServer;
app.use(express.static('public'));