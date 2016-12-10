var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var mongoose = require('mongoose');
var HighScores = require('./models/high-score');
var app = express();
var config = require('./config');
var server = http.Server(app);
var io = socket_io(server);

var asteroidData,
	numberOfClients = 0;
createAsteroidGenerations();

io.sockets.on('connection', function (socket) {
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

  socket.on('hitEnemyShipUpdateScore', function(){
  	socket.broadcast.emit('updateEnemyScore');
  });

  socket.on('lowerMyScore', function(){
  	socket.broadcast.emit('enemyGotHitAsteroid');
  });

  socket.on('disconnect', function() {
  	if (numberOfClients > 0){
  		numberOfClients--;
  	}
  });

  socket.on('winner', function(nameWinner){
  	var query = {
  		name : nameWinner
  	}
  	console.log(nameWinner);
  	HighScores.find({name : nameWinner}, function(err, highscore) {
        if (err) {
            console.log('problem with db');
        }
        if (!highscore.length) {
        	console.log("No item found, creating item");
        	var highscore = [{name : nameWinner, 'wins': 1}];
        	HighScores.create({name : nameWinner, 'wins': 1});
   		}
    	else {
        	highscore[0].wins += 1;
	        console.log(highscore);
	    }
	    numberOfClients = 0;
	    io.emit('playAgain', highscore);
    });
  });	

  socket.on('playerReady', function(){
  	numberOfClients++;
  	console.log(numberOfClients);
  	if (numberOfClients == 2){
  		io.emit('bothReady');
  	}
  });

  socket.on('getHighScores', function(){
  	HighScores.find(function(err, scores){
  		if (err) {
            console.log('problem with db');
        }
  		var highestScore = 0;
  		var highestInfo;
  		for (var i = 0, scoresLength = scores.length; i < scoresLength; i++){
  			if (scores[i].wins > highestScore){
  				highestScore = scores[i].wins;
  				highestInfo = scores[i];
  			}
  		}
  		socket.emit('highestScoringPerson', highestInfo);
  	});
  });
});

function createAsteroidGenerations(){           //creates all of the values for the asteroids to simultaneously send to each client
	randomLocationValuesForAsteroids = [];        //this allows for both players to have asteroids in the same spaces at the same time
	randomAngularVelocityValues = [];             //without huge amounts of data being sent back and forth
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