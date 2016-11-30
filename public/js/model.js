
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

socket.on('bothReady', function(){
	setTimeout(function(){
		$('#waiting-lobby').hide();
		game = new Phaser.Game(1920, 1920, Phaser.CANVAS, 'phaser', { preload: preload, create: create, update: update });
		$('#game-menu').show();
		updateScore();
	},2000);
});

var shipPosition;

function preload() {
  game.load.image('starfield', 'https://raw.githubusercontent.com/jschomay/phaser-demo-game/master/assets/starfield.png');
  game.load.image('ship1', '../assets/ship1.png');
  game.load.image('bullet', '../assets/bullet.png');
  game.load.image('asteroidMed', '../assets/asteroid-medium.png');

}

var sprite,
	text;

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
    ship1.body.drag.x = 50;
    ship1.body.drag.y = 50;
    ship1.body.maxVelocity.x = 300;
    ship1.body.maxVelocity.y = 300;
    ship1.body.collideWorldBounds = true;

    

    enemyShip = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(enemyShip, Phaser.Physics.ARCADE);
    enemyShip.enableBody=true;

    game.camera.follow(ship1,Phaser.Camera.FOLLOW_LOCKON);
    game.camera.x = ship1.position.x;
    game.camera.y = ship1.position.y;

   	bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
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

        wasd.up.onDown.add(function(){
        	ship1.body.velocity.y-- ;
        	getAngle();
        	ship1.angle = newAngle;
        });
        wasd.down.onDown.add(function(){
        	ship1.body.velocity.y++ ;
        	getAngle();
        	ship1.angle = newAngle;
        });
        wasd.left.onDown.add(function(){
        	ship1.body.velocity.x--;
        	getAngle();
        	ship1.angle = newAngle;
        });
        wasd.right.onDown.add(function(){
        	ship1.body.velocity.x++;
        	getAngle();
        	ship1.angle = newAngle;
        });
        wasd.fire.onDown.add(function(){
        	fire();
        });
        socket.emit('enemyMove', locationData);
}

function getAngle(){
	newAngle = Math.atan2(shipsVelocity.y, shipsVelocity.x)
	newAngle = (newAngle * 180 / Math.PI);
}

function fire() {

	var bullet = bullets.getFirstExists(false);

	if(bullet) {
		bullet.reset(ship1.x, ship1.y +4);
		bullet.angle = ship1.angle;
		if (ship1.body.velocity.x >= 0){
			bullet.body.velocity.x = (ship1.body.velocity.x + 200);
		}
		else {
			bullet.body.velocity.x = (ship1.body.velocity.x - 200);
		}
		if (ship1.body.velocity.y >= 0){
			bullet.body.velocity.y = (ship1.body.velocity.y + 200);
		}
		else {
			bullet.body.velocity.y = (ship1.body.velocity.y - 200);
		}
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


function shipHitAsteroid() {
	//myScore--;
	//updateScore();
	//randomReset(ship1);
}

function bulletHitAsteroid(bullet, asteroid) {
	asteroid.kill();
	bullet.kill();
}

function enemyKilledYou(){
	randomReset(ship1);
	enemyScore++;
	updateScore();
}

function killedEnemy(){
	randomReset(enemyShip);
	myScore++;
	updateScore();
}

function updateScore(){
	$('#my-score').html(myName +'s score: ' + myScore + ' <br/> ' + 'Enemy Score: ' + enemyScore);
	if (myScore === 1){
		alert('You win!');
		socket.emit('winner', myName);
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


