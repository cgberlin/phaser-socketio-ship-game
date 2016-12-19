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
	newAngle,
	shipAlive = true,
	roomNumber;

$('#start-button').on('click', function(){
	validateStartBox();
});

$('#name').keydown(function(event){
	if(event.keyCode == 13){
		validateStartBox();
	}
});

function validateStartBox() {
	if ($('#name').val() != ''){
		myName = $('#name').val();
		$('#main-menu').hide();
		$('#waiting-lobby').show();
		socket.emit('playerReady');
	}
	else {
		alert('need a name to play');
	}
}

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

socket.on('bothReady', function(roomToJoin){    //checks to make sure both players are ready, then initializes the game
	roomNumber = roomToJoin;
	console.log(roomNumber);
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
	console.log('creating new game');             //if both players choose to play again, it will destroy and reset the game
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
  game.load.image('asteroidMed', '../assets/asteroid-grey.png');
  game.load.image('laser', '../assets/rain.png');
  game.load.spritesheet('explosions', '../assets/boom.png', 32, 32);
}

var sprite,
	text,
	boom, 
	trail;

function create() {

    starfield = game.add.tileSprite(0, 0, 4000, 4000, 'starfield');
   
    game.world.setBounds(0, 0, 4000, 4000);
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;

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
    ship1.angle = -90;                                     //creation and initialization of the players ship
    ship1.anchor.set(0.5,0.5);
    ship1.body.drag.set(100);
    ship1.body.maxVelocity.set(300);
    ship1.body.collideWorldBounds = true;

    emitter = game.add.emitter(0, 0, 1000);       //creates the particle emitter for the players ship
  	emitter.makeParticles('laser');
  	ship1.addChild(emitter);
    emitter.y = 0;
  	emitter.x = -16;
	emitter.lifespan = 500;
    emitter.maxParticleSpeed = new Phaser.Point(-100,50);
    emitter.minParticleSpeed = new Phaser.Point(-200,-50);

    enemyShip = game.add.sprite(game.world.centerX, game.world.centerY, 'ship1');    
    game.physics.enable(enemyShip, Phaser.Physics.ARCADE);           //spawns the enemy ship
    enemyShip.enableBody=true;

    game.camera.follow(ship1,Phaser.Camera.FOLLOW_LOCKON);

   	bullets = game.add.group();                 //creates group and rules for player bullets
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    enemyBullets = game.add.group();               //creates group and rules for enemy bullets
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);
    socket.emit('SendOverTheAsteroidData', roomNumber);

    groupHold = game.add.group();

    if (winW < 768) {
    	game.input.onDown.add(mobileMove, this);
    }
}

function update() {
		shipPosition = ship1.position;
		locationData = {
			position : ship1.position,
			angle : ship1.angle
		}

		shipsVelocity = ship1.body.velocity;
        game.physics.arcade.collide(asteroids);

        game.physics.arcade.overlap(bullets, asteroids, bulletHitAsteroid, null, this);     //collision/overlap checks for all the game elements
        game.physics.arcade.overlap(ship1, asteroids, shipHitAsteroid, null, this);
        game.physics.arcade.overlap(enemyBullets, ship1, enemyKilledYou, null, this);
        game.physics.arcade.overlap(bullets, enemyShip, killedEnemy, null, this);



       	if (wasd.left.isDown) {            
       		if (shipAlive == true) {           //checks to make sure death animation isnt playing before allowing movement and particles
	       		emitter.emitParticle();
	       		ship1.body.angularVelocity = -200;
	       	}
       	}
       	else if (wasd.right.isDown) {
       		if (shipAlive == true) {
	       		emitter.emitParticle();
	       		ship1.body.angularVelocity = 200;
	       	}
       	}
       	else {
       		ship1.body.angularVelocity = 0;
       	}

       	if (wasd.up.isDown) {
       		if (shipAlive == true) {
	       		emitter.emitParticle();
	       		game.physics.arcade.accelerationFromRotation(ship1.rotation, 300, ship1.body.acceleration);
		    }
       	}
       	else {
       		ship1.body.acceleration.set(0);
       	}

       	if (wasd.fire.isDown) {
       		if (shipAlive == true) {
       			fire();
       		}
       	}
        socket.emit('enemyMove', {"locationData" : locationData, "roomNumber" : roomNumber});    //sends ships data to the server
}

function fire() {

	var bullet = bullets.getFirstExists(false);      //bullet generation

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
		socket.emit('myBullets', {"bulletLocationInfo" : bulletLocationInfo, "roomNumber" : roomNumber});  //sends bullet info to the server
	}
}

function randomReset(WhatKind){
	WhatKind.reset(game.rnd.integerInRange(30, game.world.height), game.rnd.integerInRange(30, game.world.height));
}

function shipHitAsteroid(ship, asteroid){
	ship1.loadTexture('explosions', 0);
	ship1.animations.add('explode');
	ship1.animations.play('explode', 7, false, true);
	shipAlive = false;
	setTimeout(function(){
		randomReset(ship1);
		ship1.loadTexture('ship1');
		shipAlive = true;
	}, 2000);
	asteroid.kill();

	if (myScore > 0){
		myScore--;
		updateScore();
		socket.emit('lowerMyScore', roomNumber);
	}
}

function bulletHitAsteroid(bullet, asteroid) {
	asteroid.loadTexture('explosions', 0);
	asteroid.animations.add('explode');
	asteroid.animations.play('explode', 7, false, true);
	groupHold.add(asteroid);
	setTimeout(function(){asteroid.kill();},2000);
	bullet.kill();
}

function enemyKilledYou(){ 
	enemyBullets.callAll('kill');
	ship1.loadTexture('explosions', 0);
	ship1.animations.add('explode');
	ship1.animations.play('explode', 7, false, true);
	shipAlive = false;
	setTimeout(function(){
		randomReset(ship1);
		ship1.loadTexture('ship1');
		shipAlive = true;
	}, 2000);
}

function mobileMove(ship){
	game.physics.arcade.moveToPointer(ship1, 300);
	ship1.rotation = game.physics.arcade.angleToPointer(ship1);
	fire();
}

function killedEnemy(){
	bullets.callAll('kill');
	randomReset(enemyShip);
	myScore++;
	updateScore();
	socket.emit('hitEnemyShipUpdateScore', roomNumber);
}

function updateScore(){
	$('#my-score').html('My score: ' + myScore + ' <br/> ' + 'Enemy Score: ' + enemyScore);
	if (myScore === 5){
		alert('You win!');
		socket.emit('winner', {"myName" : myName, "roomNumber" : roomNumber});
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

socket.on('sendAsteroidData', function(data){           //handles all of the asteroid generation using values sent from the server
	var numberOfAsteroids = data.numberOfAsteroids;
	var large = 8;
    for (var i = 0; i < numberOfAsteroids; i++){
    	var asteroid = asteroids.create(data.locationValues[i].x, data.locationValues[i].y, 'asteroidMed');
        asteroid.anchor.set(0.5, 0.5);
        asteroid.body.angularVelocity = data.angularVelocities[i];
	    var randomAngle = game.math.degToRad(data.angles[i]);
	    var randomVelocity = data.randomVelocities[i];	 	
	    game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
   		asteroid.body.collideWorldBounds = true;
   		asteroid.body.bounce.setTo(0.9, 0.9);
   		if (large > 0){
   			asteroid.scale.setTo(0.5, 0.5); 
   			large--;
   		}
 		else {
 			asteroid.scale.setTo(0.25, 0.25); 
 		}    
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
