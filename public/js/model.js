
var winH = window.innerHeight;
var winW = window.innerWidth;
var socket = io();
var game,
	enoughClients = false,
	myScore = 0,
	enemyScore = 0,
	scoreText,
	myName,
	shipsVelocity,
	newAngle;

$('#start-button').on('click', function(){
	if ($('#name').val() != ''){
		myName = $('#name').val();
		$('#main-menu').hide();
		$('#waiting-lobby').show();
		socket.emit('playerReady');
	}
	else {
		alert('need a name to play');
	}
});

$('#instructions-button').on('click', function(){
	$('#main-menu').hide();
	$('#instructions').css('display', 'flex');
});

$('.back-to-menu').on('click', function(){
	$('#high-scores').hide();
	$('#instructions').hide();
	$('#main-menu').show();
});

$('#high-scores-button').on('click', function(){
	socket.emit('getHighScores');
});

socket.on('highestScoringPerson', function(highestInfo){
	$('#main-menu').hide();
	$('#high-scores').css('display', 'flex');
	$('#high-score-info').html(highestInfo.name + '<br/>' + highestInfo.wins);
});

socket.on('bothReady', function(){
	setTimeout(function(){
		$('#waiting-lobby').hide();
		game = new Phaser.Game(winW, winH, Phaser.CANVAS, 'phaser', { preload: preload, create: create, update: update });
		$('#game-menu').show();
		updateScore();
	},2000);
});

socket.on('playAgain', function(winnerInfo){
	$('#play-again-menu').show();
	$('#winners-info-end-game').html(winnerInfo[0].name + '<br/>' + 'Wins:' + ' ' + winnerInfo[0].wins);
});

$('#play-again-button').on('click', function(){
	console.log('creating new game');
	enoughClients = false;
	myScore = 0;
	enemyScore = 0;
	game.destroy();
	$('#game-menu').hide();
	$('#play-again-menu').hide();
	$('#waiting-lobby').show();
	socket.emit('playerReady');
});

var shipPosition;

function preload() {
  game.load.image('starfield', 'https://raw.githubusercontent.com/jschomay/phaser-demo-game/master/assets/starfield.png');
  game.load.image('ship1', '../assets/ship1.png');
  game.load.image('bullet', '../assets/bullet.png');
  game.load.image('asteroidMed', '../assets/asteroid-medium.png');
  game.load.spritesheet('explosions', '../assets/boom.png', 32, 32);
}

var sprite,
	text,
	boom;

function create() {

    starfield = game.add.tileSprite(0, 0, 4000, 4000, 'starfield');
   
    game.world.setBounds(0, 0, 4000, 4000);

    game.input.keyboard.createCursorKeys();
    wasd = {
		  up: game.input.keyboard.addKey(Phaser.Keyboard.W),
		  down: game.input.keyboard.addKey(Phaser.Keyboard.S),
		  left: game.input.keyboard.addKey(Phaser.Keyboard.A),
		  right: game.input.keyboard.addKey(Phaser.Keyboard.D),
		  fire : game.input.keyboard.addKey(Phaser.Keyboard.F)
		};


    asteroids = game.add.group();
    asteroids.enableBody = true;
    asteroids.physicsBodyType = Phaser.Physics.ARCADE;


	
    ship1 = game.add.sprite(game.rnd.integerInRange(30, game.world.height), game.rnd.integerInRange(30, game.world.height) , 'ship1');    
    game.physics.enable(ship1, Phaser.Physics.ARCADE);
    ship1.enableBody=true;
    ship1.angle = -90;
    ship1.anchor.set(0.5,0.5);
    ship1.body.drag.set(100);
    ship1.body.maxVelocity.set(300);
    ship1.body.collideWorldBounds = true;

    enemyShip = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(enemyShip, Phaser.Physics.ARCADE);
    enemyShip.enableBody=true;

    game.camera.follow(ship1,Phaser.Camera.FOLLOW_LOCKON);

   	bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
    socket.emit('SendOverTheAsteroidData');
}

function update() {
		shipPosition = ship1.position;
		locationData = {
			position : ship1.position,
			angle : ship1.angle
		}

		shipsVelocity = ship1.body.velocity;
        game.physics.arcade.collide(asteroids);

        game.physics.arcade.overlap(bullets, asteroids, bulletHitAsteroid, null, this);
        game.physics.arcade.overlap(ship1, asteroids, shipHitAsteroid, null, this);
        game.physics.arcade.overlap(enemyBullets, ship1, enemyKilledYou, null, this);
        game.physics.arcade.overlap(bullets, enemyShip, killedEnemy, null, this);

       	if (wasd.left.isDown) {
       		ship1.body.angularVelocity = -200;
       	}
       	else if (wasd.right.isDown) {
       		ship1.body.angularVelocity = 200;
       	}
       	else {
       		ship1.body.angularVelocity = 0;
       	}

       	if (wasd.up.isDown) {
       		game.physics.arcade.accelerationFromRotation(ship1.rotation, 300, ship1.body.acceleration);
       	}
       	else {
       		ship1.body.acceleration.set(0);
       	}

       	if (wasd.fire.isDown) {
       		fire();
       	}
        socket.emit('enemyMove', locationData);
}

function fire() {

	var bullet = bullets.getFirstExists(false);

	if(bullet) {
		var x = ship1.x + (Math.cos(ship1.rotation) * length);
        var y = ship1.y + (Math.sin(ship1.rotation) * length);
		bullet.reset(x, y);
		bullet.rotation = ship1.rotation;
		game.physics.arcade.velocityFromRotation(ship1.rotation, 450, bullet.body.velocity);
		bulletLocationInfo = {
			position : bullet.position,
			angle : bullet.angle,
			velocity : bullet.body.velocity,
			rotation : bullet.rotation
		}
		socket.emit('myBullets', bulletLocationInfo);
	}
}

function randomReset(WhatKind){
	WhatKind.reset(game.rnd.integerInRange(30, game.world.height), game.rnd.integerInRange(30, game.world.height));
}

function boomDone() {
	randomReset(ship1);
}

function shipHitAsteroid(ship, asteroid){
	ship1.loadTexture('explosions', 0);
	ship1.animations.add('explode');
	ship1.animations.play('explode', 7, false, true);
	setTimeout(function(){
		randomReset(ship1);
		ship1.loadTexture('ship1');
	}, 2000);
	asteroid.kill();

	if (myScore > 0){
		myScore--;
		updateScore();
		socket.emit('lowerMyScore');
	}
}

function bulletHitAsteroid(bullet, asteroid) {
	asteroid.kill();
	bullet.kill();
}

function enemyKilledYou(){
	ship1.loadTexture('explosions', 0);
	ship1.animations.add('explode');
	ship1.animations.play('explode', 7, false, true);
	setTimeout(function(){
		randomReset(ship1);
		ship1.loadTexture('ship1');
	}, 2000);
}

function killedEnemy(){
	randomReset(enemyShip);
	myScore++;
	updateScore();
	socket.emit('hitEnemyShipUpdateScore');
}

function updateScore(){
	$('#my-score').html('My score: ' + myScore + ' <br/> ' + 'Enemy Score: ' + enemyScore);
	if (myScore === 5){
		alert('You win!');
		socket.emit('winner', myName);

	}
	else if (enemyScore === 5){
		alert('Enemy Won');
	}
}

socket.on('updateEnemyMove', function(enemyLocation){
		enemyShip.position.x = enemyLocation.position.x;
		enemyShip.position.y = enemyLocation.position.y;
		enemyShip.angle = enemyLocation.angle;
});

socket.on('enemyBullets', function(bulletLocationInfo){
	var enemyBullet = enemyBullets.create(bulletLocationInfo.position.x, bulletLocationInfo.position.y, 'bullet');
	enemyBullet.angle = bulletLocationInfo.angle;
	enemyBullet.body.velocity.x = bulletLocationInfo.velocity.x;
	enemyBullet.body.velocity.y = bulletLocationInfo.velocity.y;
});

socket.on('sendAsteroidData', function(data){
	var numberOfAsteroids = data.numberOfAsteroids;
    for (var i = 0; i < numberOfAsteroids; i++){
    	var asteroid = asteroids.create(data.locationValues[i].x, data.locationValues[i].y, 'asteroidMed');
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.angularVelocity = data.angularVelocities[i];
	    var randomAngle = game.math.degToRad(data.angles[i]);
	    var randomVelocity = data.randomVelocities[i];	 	
	    game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
   		asteroid.body.collideWorldBounds = true;
   		asteroid.body.bounce.setTo(0.9, 0.9);
    }
});

socket.on('updateEnemyScore', function(){
	enemyScore++;
	updateScore();
});

socket.on('enemyGotHitAsteroid', function(){
	enemyScore--;
	updateScore();
});
